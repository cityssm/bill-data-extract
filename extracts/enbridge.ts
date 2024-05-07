import { trimToNumber } from '../helpers/numbers.js'
import { trimTextFromEndUntil } from '../helpers/trimmers.js'
import { extractData } from '../index.js'

import type { BillData, DataExtractOptions } from './types.js'

const enbridgeDataExtractOptions: DataExtractOptions<EnbridgeData> = {
  accountNumber: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 53,
      yPercentage: 21
    },
    bottomRightCoordinate: {
      xPercentage: 63,
      yPercentage: 24
    },
    processingFunction(tesseractResult): string {
      const textPieces = tesseractResult.data.text.trim().split('\n')
      let text = textPieces.at(-1) ?? ''

      text = text.replaceAll(' ', '')
      text = text.replaceAll('¢', '6')

      return text
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
      let text = trimTextFromEndUntil(tesseractResult.data.text.trim(), /\d/)

      const textPieces = text.split('\n')

      text = textPieces.at(-1) ?? ''

      return text
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

export interface EnbridgeData extends BillData {
  gasUsage: number
  gasUsageUnit: 'm3'
}

/**
 * Extracts data from an Enbridge gas bill.
 * @param {string} enbridgePdfPath - Path to an Enbridge bill.
 * @returns {Promise<EnbridgeData>} - Enbridge bill data.
 */
export async function extractEnbridgeBillData(
  enbridgePdfPath: string
): Promise<EnbridgeData> {
  const data = await extractData([enbridgePdfPath], enbridgeDataExtractOptions)

  data.gasUsageUnit = 'm3'

  return data
}
