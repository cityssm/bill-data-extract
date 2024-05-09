import { SectorFlow } from '@cityssm/sectorflow'
import { dateToString } from '@cityssm/utils-datetime'
import { parse } from 'date-fns/parse'
import Debug from 'debug'

import { replaceDateStringTypos } from '../helpers/dateHelpers.js'
import { trimToNumber } from '../helpers/numberHelpers.js'
import { trimTextFromEndUntil } from '../helpers/trimmingHelpers.js'
import { extractData, extractFullPageText } from '../index.js'
import { getTemporaryProjectId } from '../utilities/sectorflowUtilities.js'

import type { DataExtractOptions, GasBillData } from './types.js'

const debug = Debug('bill-data-extract:enbridge')

export const enbridgeExtractType = 'enbridge'
export const enbridgeDomain = 'enbridgegas.com'

const enbridgeDataExtractOptions: DataExtractOptions<GasBillData> = {
  accountNumber: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 53,
      yPercentage: 21
    },
    bottomRightCoordinate: {
      xPercentage: 65,
      yPercentage: 24
    },
    processingFunction(tesseractResult): string {
      const textPieces = tesseractResult.data.text.trim().split('\n')
      let text = textPieces.at(-1) ?? ''

      text = text.replaceAll(' ', '')
      text = text.replaceAll(':', '2')
      text = text.replaceAll(';', '2')
      text = text.replaceAll('¢', '6')

      return text
    }
  },
  serviceAddress: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 52,
      yPercentage: 15
    },
    bottomRightCoordinate: {
      xPercentage: 93,
      yPercentage: 21
    },
    processingFunction(tesseractResult) {
      const textLines = tesseractResult.data.text.trim().split('\n')
      return (textLines[1] ?? '').trim().replaceAll('  ', ' ')
    }
  },
  totalAmountDue: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 18,
      yPercentage: 42
    },
    bottomRightCoordinate: {
      xPercentage: 36,
      yPercentage: 47
    },
    processingFunction(tesseractResult): number | undefined {
      return trimToNumber(tesseractResult.data.text)
    }
  },
  dueDate: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 21,
      yPercentage: 47
    },
    bottomRightCoordinate: {
      xPercentage: 33,
      yPercentage: 51
    },
    processingFunction(tesseractResult) {
      const textPieces = trimTextFromEndUntil(
        tesseractResult.data.text.trim(),
        /\d/
      ).split('\n')

      const dateString = replaceDateStringTypos(textPieces.at(-1) ?? '')
      const date = parse(dateString, 'LLL dd, y', new Date())

      return dateToString(date)
    }
  },
  gasUsage: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 50,
      yPercentage: 43
    },
    bottomRightCoordinate: {
      xPercentage: 69,
      yPercentage: 52
    },
    processingFunction(tesseractResult) {
      const textLines = tesseractResult.data.text.trim().split('\n')

      for (const textLine of textLines) {
        if (/\d/.test(textLine)) {
          return trimToNumber(textLine, false)
        }
      }

      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined
    }
  }
}

/**
 * Extracts data from an Enbridge gas bill.
 * @param {string} enbridgePdfPath - Path to an Enbridge bill.
 * @returns {Promise<GasBillData>} - Enbridge bill data.
 */
export async function extractEnbridgeBillData(
  enbridgePdfPath: string
): Promise<GasBillData> {
  const data = await extractData([enbridgePdfPath], enbridgeDataExtractOptions)

  data.gasUsageUnit = 'm3'

  return data
}

/**
 * Extracts data from an Enbridge bill using SectorFlow AI.
 * @param {string} enbridgePdfPath - Path to an Enbridge bill.
 * @param {string} sectorFlowApiKey - SectorFlow API key.
 * @returns {Promise<GasBillData>} - Enbridge bill data.
 */
export async function extractEnbridgeBillDataWithSectorFlow(
  enbridgePdfPath: string,
  sectorFlowApiKey: string
): Promise<GasBillData> {
  const data = await extractData([enbridgePdfPath], {
    text: {
      pageNumber: 1,
      topLeftCoordinate: {
        xPercentage: 0,
        yPercentage: 12
      },
      bottomRightCoordinate: {
        xPercentage: 100,
        yPercentage: 70
      }
    }
  })

  const rawText = data.text as string // await extractFullPageText(enbridgeBillPath)

  const sectorFlow = new SectorFlow(sectorFlowApiKey)

  const projectId = await getTemporaryProjectId(sectorFlow)

  const prompt = `Given the following text, extract
  the "Account Number" as "accountNumber",
  the "Service Address" as "serviceAddress",
  the usage as "gasUsage",
  the "Total Amount" as "totalAmountDue",
  and the "Due Date" as "dueDate"
  into a JSON object.
  The "accountNumber" is in the first half of the text.
  The "accountNumber" is a text string with 12 digits separated by spaces, and starting with "9".
  The "accountNumber" is next to the bill date.
  The "accountNumber does not contain dashes.
  The "dueDate" should be formatted as "yyyy-mm-dd".
  The "gasUsage" is a number followed by "m3".
  The "totalAmountDue" is the dollar amount including taxes.
  The "totalAmountDue" and "gasUsage" should be formatted as numbers.
  
  ${rawText}`

  const response = await sectorFlow.sendChatMessage(projectId, prompt)

  const json: Partial<GasBillData> = JSON.parse(
    response.choices[0].choices[0].message.content
  )

  /*
   * Clean up project.
   */

  await sectorFlow.deleteProject(projectId)

  json.accountNumber = json.accountNumber?.replaceAll(' ', '')
  json.gasUsageUnit = 'm3'

  return json as GasBillData
}

/**
 * Extracts data from an Enbridge bill, using local zone-based OCR first, falling back to SectorFlow AI.
 * @param {string} enbridgeBillPath - Path to an Enbridge bill.
 * @param {string} sectorFlowApiKey - SectorFlow API key.
 * @returns {Promise<GasBillData>} - Enbridge bill data.
 */
export async function extractEnbridgeBillDataWithSectorFlowBackup(
  enbridgeBillPath: string,
  sectorFlowApiKey: string
): Promise<GasBillData | undefined> {
  let billData: GasBillData | undefined

  try {
    billData = await extractEnbridgeBillData(enbridgeBillPath)
  } catch {}

  if (billData === undefined || !/^\d{12}/.test(billData.accountNumber)) {
    debug('Falling back to SectorFlow')

    billData = await extractEnbridgeBillDataWithSectorFlow(
      enbridgeBillPath,
      sectorFlowApiKey
    )
  }

  return billData
}

/**
 * Checks whether a bill is an Enbridge bill.
 * @param {string} billPath - Path to a bill.
 * @returns {Promise<boolean>} - Whether or not the bill is an Enbridge bill.
 */
export async function isEnbridgeBill(billPath: string): Promise<boolean> {
  const fullText = await extractFullPageText(billPath)
  return fullText.includes(enbridgeDomain)
}
