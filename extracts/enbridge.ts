import { trimTextFromEndUntil, trimTextFromStartUntil } from '../dataHelpers.js'
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
  usage: {
    pageNumber: 1,
    topLeftCoordinate: {
      xPercentage: 50.5,
      yPercentage: 46
    },
    bottomRightCoordinate: {
      xPercentage: 68,
      yPercentage: 49
    },
    processingFunction(tesseractResult) {
      let text = tesseractResult.data.text.trim()
      text = trimTextFromEndUntil(text, /m/)
      text = text.replaceAll(',', '')
      text = text.slice(0, -1)
      return Number.parseInt(text)
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
      let text = tesseractResult.data.text.trim()
      text = trimTextFromStartUntil(text, /\d/)
      text = text.replace(',', '')

      try {
        return Number.parseFloat(text)
      } catch {
        return undefined
      }
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
  }
}

export interface EnbridgeData extends BillData {
  usage: number
  usageUnit: 'm3'
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
  data.usageUnit = 'm3'
  return data
}
