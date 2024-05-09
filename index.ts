import fs from 'node:fs/promises'

import Debug from 'debug'
import type Tesseract from 'tesseract.js'
import { createWorker } from 'tesseract.js'

import type { DataExtractOptions } from './extracts/types.js'
import {
  imageFilePathsToImageFiles,
  pdfFilePathToImageFilePaths
} from './utilities/imageUtilities.js'
import { percentageToCoordinate } from './utilities/mathUtilities.js'

const debug = Debug('bill-data-extract:index')

function getOCRCacheKey(options: {
  imagePath: string
  pageNumber: number
  xTop: number
  yTop: number
  xBottom: number
  yBottom: number
}): string {
  return `${options.imagePath}::${options.pageNumber}::${options.xTop}::${options.yTop}::${options.xBottom}::${options.yBottom}`
}

// eslint-disable-next-line no-secrets/no-secrets
/**
 * Extracts data from a series of files.
 * @param {string[]} pdfOrImageFilePaths - A list of paths to PDFs or images that represent a single bill.
 * @param {DataExtractOptions} extractOptions - Options describing where the extract should occur.
 * @returns {Promise<object>} - Extracted data.
 */
export async function extractData<T extends Record<string, unknown>>(
  pdfOrImageFilePaths: string[],
  extractOptions: DataExtractOptions<T>
): Promise<T> {
  const imageFilePaths: string[] = []
  const tempFilePaths: string[] = []

  /*
   * Ensure all files are images
   */

  for (const filePath of pdfOrImageFilePaths) {
    if (filePath.toLowerCase().endsWith('.pdf')) {
      const tempImageFilePaths = await pdfFilePathToImageFilePaths(filePath)

      imageFilePaths.push(...tempImageFilePaths)
      tempFilePaths.push(...tempImageFilePaths)
    } else {
      imageFilePaths.push(filePath)
    }
  }

  /*
   * Populate image dimensions
   */

  const imageFiles = imageFilePathsToImageFiles(imageFilePaths)

  /*
   * Extract data
   */

  const ocrCache: Record<string, Tesseract.RecognizeResult> = {}

  const result = {}
  const worker = await createWorker()

  try {
    for (const [dataFieldName, dataFieldOptions] of Object.entries(
      extractOptions
    )) {
      const image = imageFiles[(dataFieldOptions.pageNumber ?? 1) - 1]

      const xTop = percentageToCoordinate(
        dataFieldOptions.topLeftCoordinate?.xPercentage ?? 0,
        image.width as number
      )
      const yTop = percentageToCoordinate(
        dataFieldOptions.topLeftCoordinate?.yPercentage ?? 0,
        image.height as number
      )

      const xBottom = percentageToCoordinate(
        dataFieldOptions.bottomRightCoordinate?.xPercentage ?? 100,
        image.width as number
      )
      const yBottom = percentageToCoordinate(
        dataFieldOptions.bottomRightCoordinate?.yPercentage ?? 100,
        image.height as number
      )

      const rectangle: Tesseract.Rectangle = {
        top: yTop,
        left: xTop,
        width: xBottom - xTop - 1,
        height: yBottom - yTop
      }

      debug(`Finding "${dataFieldName}"...`)

      const ocrCacheKey = getOCRCacheKey({
        imagePath: image.path,
        pageNumber: dataFieldOptions.pageNumber ?? 1,
        xTop,
        yTop,
        xBottom,
        yBottom
      })

      // eslint-disable-next-line security/detect-object-injection
      let rawText = ocrCache[ocrCacheKey]

      if (rawText === undefined) {
        rawText = await worker.recognize(image.path, {
          rectangle
        })

        // eslint-disable-next-line security/detect-object-injection
        ocrCache[ocrCacheKey] = rawText
      } else {
        debug(`OCR Cache Hit: ${ocrCacheKey}`)
      }

      debug(`Raw Text: ${rawText.data.text}`)

      // eslint-disable-next-line security/detect-object-injection
      result[dataFieldName] =
        dataFieldOptions.processingFunction === undefined
          ? rawText.data.text.trim()
          : dataFieldOptions.processingFunction(rawText)

      // eslint-disable-next-line security/detect-object-injection
      debug(`${dataFieldName}: ${result[dataFieldName]}`)
    }
  } finally {
    await worker.terminate()
  }

  /*
   * Clean up temp files
   */

  for (const tempFilePath of tempFilePaths) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.unlink(tempFilePath)
    } catch (error) {
      console.log(error)
    }
  }

  return result as T
}

/**
 * Extracts the full text for a given page.
 * @param {string} billPath - The bill path.
 * @param {number} pageNumber - The page number, defaults to 1.
 * @returns {string} - The full text of the given page.
 */
export async function extractFullPageText(
  billPath: string,
  pageNumber: number = 1
): Promise<string> {
  const rawData = await extractData([billPath], {
    text: {
      pageNumber
    }
  })

  return rawData.text as string
}

export { getSuggestedExtractType } from './utilities/extractUtilities.js'

export type {
  DataExtractOptions,
  DataField,
  DataFieldCoordinate,
  BillData,
  GasBillData,
  ElectricityBillData,
  WaterBillData
} from './extracts/types.js'
