import { trimToNumber } from '../helpers/numbers.js'
import { trimTextFromEndUntil } from '../helpers/trimmers.js'
import { extractData } from '../index.js'

import type { DataExtractOptions, GasBillData } from './types.js'

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
