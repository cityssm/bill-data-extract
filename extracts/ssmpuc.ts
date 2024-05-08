import { SectorFlow } from '@cityssm/sectorflow'
import { dateToString } from '@cityssm/utils-datetime'
import { parse } from 'date-fns/parse'
import Debug from 'debug'
import type Tesseract from 'tesseract.js'

import { cleanNumberText, trimToNumber } from '../helpers/numbers.js'
import { extractData } from '../index.js'
import { replaceDateStringTypos } from '../utilities/dateUtilities.js'
import { getTemporaryProjectId } from '../utilities/sectorflowUtilities.js'

import type { BillData, DataExtractOptions } from './types.js'

const debug = Debug('bill-data-extract:ssmpuc')

const ssmpucDataExtractOptions: DataExtractOptions<SSMPUCData> = {
  accountNumber: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 79,
      yPercentage: 5
    },
    bottomRightCoordinate: {
      xPercentage: 95,
      yPercentage: 9
    },
    processingFunction(tesseractResult): string {
      const textPieces = tesseractResult.data.text.trim().split('\n')
      return textPieces.at(-1) ?? ''
    }
  },
  serviceAddress: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 54.6,
      yPercentage: 10.7
    },
    bottomRightCoordinate: {
      xPercentage: 80.8,
      yPercentage: 16.5
    },
    processingFunction(tesseractResult) {
      const textPieces = tesseractResult.data.text.trim().split('\n')
      return (textPieces.at(-1) ?? '').trim()
    }
  },
  totalAmountDue: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 61.75,
      yPercentage: 87.75
    },
    bottomRightCoordinate: {
      xPercentage: 74,
      yPercentage: 91
    },
    processingFunction(tesseractResult): number | undefined {
      return trimToNumber(tesseractResult.data.text)
    }
  },
  dueDate: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 48,
      yPercentage: 87.75
    },
    bottomRightCoordinate: {
      xPercentage: 61,
      yPercentage: 91
    },
    processingFunction(tesseractResult) {
      const textPieces = tesseractResult.data.text.trim().split('\n')

      const dateString = replaceDateStringTypos(textPieces.at(-1) ?? '')
      const date = parse(dateString, 'LLL dd y', new Date())

      return dateToString(date)
    }
  },
  electricityUsageMetered: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 2.5,
      yPercentage: 36.5
    },
    bottomRightCoordinate: {
      xPercentage: 77,
      yPercentage: 47
    },
    processingFunction(tesseractResult): number | undefined {
      return extractLastNumberInRow('E', tesseractResult)
    }
  },
  electricityUsageBilled: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 2.5,
      yPercentage: 36.5
    },
    bottomRightCoordinate: {
      xPercentage: 85.5,
      yPercentage: 47
    },
    processingFunction(tesseractResult): number | undefined {
      return extractLastNumberInRow('E', tesseractResult)
    }
  },
  waterUsageMetered: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 2.5,
      yPercentage: 36.5
    },
    bottomRightCoordinate: {
      xPercentage: 77,
      yPercentage: 47
    },
    processingFunction(tesseractResult): number | undefined {
      return extractLastNumberInRow('W', tesseractResult)
    }
  },
  waterUsageBilled: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 2.5,
      yPercentage: 36.5
    },
    bottomRightCoordinate: {
      xPercentage: 85,
      yPercentage: 47
    },
    processingFunction(tesseractResult): number | undefined {
      return extractLastNumberInRow('W', tesseractResult)
    }
  }
}

function extractLastNumberInRow(
  meterType: 'E' | 'W',
  tesseractResult: Tesseract.RecognizeResult
): number | undefined {
  const textRows = tesseractResult.data.text.trim().split('\n')

  for (const textRow of textRows) {
    if (textRow.trim().startsWith(`${meterType} `)) {
      const textPieces = textRow.trim().split(' ')
      return cleanNumberText(textPieces.at(-1) ?? '', false)
    }
  }

  return undefined
}

export interface SSMPUCData extends BillData {
  waterUsageMetered: number | undefined
  waterUsageBilled: number | undefined
  waterUsageUnit: 'm3'

  electricityUsageMetered: number | undefined
  electricityUsageBilled: number | undefined
  electricityUsageUnit: 'kWh'
}

/**
 * Extracts data from an SSM PUC bill.
 * @param {string} ssmpucBillPath - Path to an SSM PUC bill.
 * @returns {Promise<SSMPUCData>} - SSM PUC bill data.
 */
export async function extractSSMPUCBillData(
  ssmpucBillPath: string
): Promise<SSMPUCData> {
  const data = await extractData([ssmpucBillPath], ssmpucDataExtractOptions)

  data.waterUsageUnit = 'm3'
  data.electricityUsageUnit = 'kWh'

  return data
}

/**
 * Extracts data from an SSM PUC bill using SectorFlow AI.
 * @param {string} ssmpucBillPath - Path to an SSM PUC bill.
 * @param {string} sectorFlowApiKey - SectorFlow API key.
 * @returns {Promise<SSMPUCData>} - SSM PUC bill data.
 */
export async function extractSSMPUCBillDataWithSectorFlow(
  ssmpucBillPath: string,
  sectorFlowApiKey: string
): Promise<SSMPUCData> {
  const rawData = await extractData([ssmpucBillPath], {
    text: {}
  })

  const sectorFlow = new SectorFlow(sectorFlowApiKey)

  const projectId = await getTemporaryProjectId(sectorFlow)

  const response = await sectorFlow.sendChatMessage(
    projectId,
    `Given the following text, extract
    the "Account Number" as "accountNumber",
    the "Service Address" as "serviceAddress",
    the electric metered usage as "electricityUsageMetered",
    the electric billed usage as "electricityUsageBilled",
    the water metered usage as "waterUsageMetered",
    the water billed usage as "waterUsageBilled",
    the "Amount Due" as "totalAmountDue",
    and the "Due Date" as "dueDate"
    into a JSON object.
    The "accountNumber" is a text string with 7 digits, a dash, and two more digits.
    The "dueDate" should be formatted as "yyyy-mm-dd".
    The "totalAmountDue", 
    "electricityUsageMetered", "electricityUsageBilled",
    "waterUsageMetered", "waterUsageBilled",
    and "totalAmountDue" should be formatted as numbers.

    The "electricityUsageBilled" is in a row of text starting with the letter "E".
    The "electricityUsageBilled" is the number right before "kWh"
    and is greater than or equal to the "electricityUsageMetered".
    
    The "electricityUsageMetered" is the sum of first numbers after "Off Peak Winter", "Mid Peak Winter", and "On Peak Winter" usage
    and is equal to a number next to the "electricityUsageBilled".
    
    The "waterUsageMetered" and "waterUsageBilled" are in a row of text starting with the letter "W".
    The "waterUsageBilled" is the number right before "cu.metre",
    The "waterUsageMetered" and "waterUsageBilled" are equal.
    If there is no value for "Water Consumption", the "waterUsageMetered" and the "waterUsageBilled" should be 0.
    
    ${rawData.text as string}`
  )

  const json = JSON.parse(response.choices[0].choices[0].message.content)

  /*
   * Clean up project.
   */

  await sectorFlow.deleteProject(projectId)

  json.waterUsageUnit = 'm3'
  json.electricityUsageUnit = 'kWh'

  return json
}

/**
 * Extracts data from an SSM PUC bill, using local zone-based OCR first, falling back to SectorFlow AI.
 * @param {string} ssmpucBillPath - Path to an SSM PUC bill.
 * @param {string} sectorFlowApiKey - SectorFlow API key.
 * @returns {Promise<SSMPUCData>} - SSM PUC bill data.
 */
export async function extractSSMPUCBillDataWithSectorFlowBackup(
  ssmpucBillPath: string,
  sectorFlowApiKey: string
): Promise<SSMPUCData | undefined> {
  let billData: SSMPUCData | undefined

  try {
    billData = await extractSSMPUCBillData(ssmpucBillPath)
  } catch {}

  if (
    billData === undefined ||
    !/^\d{7}/.test(billData.accountNumber) ||
    (billData.electricityUsageMetered ?? 0) >
      (billData.electricityUsageBilled ?? 0) ||
    (billData.waterUsageMetered ?? 0) > (billData.waterUsageBilled ?? 0)
  ) {
    debug('Falling back to SectorFlow')

    billData = await extractSSMPUCBillDataWithSectorFlow(
      ssmpucBillPath,
      sectorFlowApiKey
    )
  }

  return billData
}
