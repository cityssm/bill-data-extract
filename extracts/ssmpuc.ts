import type Tesseract from 'tesseract.js'

import { cleanNumberText, trimToNumber } from '../helpers/numbers.js'
import { extractData } from '../index.js'

import type { BillData, DataExtractOptions } from './types.js'

const ssmpucDataExtractOptions: DataExtractOptions<SSMPUCData> = {
  accountNumber: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 79,
      yPercentage: 5
    },
    bottomRightCoordinate: {
      xPercentage: 95,
      yPercentage: 8
    },
    processingFunction(tesseractResult): string {
      const textPieces = tesseractResult.data.text.trim().split('\n')
      return textPieces.at(-1) ?? ''
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
      xPercentage: 60,
      yPercentage: 91
    },
    processingFunction(tesseractResult) {
      const textPieces = tesseractResult.data.text.trim().split('\n')
      return textPieces.at(-1) ?? ''
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
      xPercentage: 85,
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
    if (textRow.trim().startsWith(meterType)) {
      const textPieces = textRow.trim().split(' ')
      return cleanNumberText(textPieces.at(-1) ?? '')
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
