import fs from 'node:fs/promises'

import Debug from 'debug'
import type Tesseract from 'tesseract.js'
import { createWorker } from 'tesseract.js'

import type { DataExtractOptions } from './extracts/types.js'
import {
  imageFilePathsToImageFiles,
  pdfFilePathToImageFilePaths,
  percentageToCoordinate
} from './utilities.js'

const debug = Debug('bill-data-extract:index')

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

  const result = {}
  const worker = await createWorker()

  try {
    for (const [dataFieldName, dataFieldOptions] of Object.entries(
      extractOptions
    )) {
      const image = imageFiles[dataFieldOptions.pageNumber - 1]

      const xTop = percentageToCoordinate(
        dataFieldOptions.topLeftCoordinate.xPercentage,
        image.width as number
      )
      const yTop = percentageToCoordinate(
        dataFieldOptions.topLeftCoordinate.yPercentage,
        image.height as number
      )

      const xBottom = percentageToCoordinate(
        dataFieldOptions.bottomRightCoordinate.xPercentage,
        image.width as number
      )
      const yBottom = percentageToCoordinate(
        dataFieldOptions.bottomRightCoordinate.yPercentage,
        image.height as number
      )

      const rectangle: Tesseract.Rectangle = {
        top: yTop,
        left: xTop,
        width: xBottom - xTop,
        height: yBottom - yTop
      }

      debug(`Finding "${dataFieldName}"...`)

      const rawText = await worker.recognize(image.path, {
        rectangle
      })

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

export type { DataExtractOptions, DataField } from './extracts/types.js'
