import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { imageSize as getImageSize } from 'image-size'
import { type ISizeCalculationResult } from 'image-size/dist/types/interface.js'
import { convert as convertPdfToImage } from 'pdf-img-convert'

/**
 * Creates images from a PDF.
 * @param {string} pdfFilePath - Path to a PDF file.
 * @returns {Promise<string[]>} - A list of temporary image paths.
 */
export async function pdfFilePathToImageFilePaths(
  pdfFilePath: string
): Promise<string[]> {
  const imageFilePaths: string[] = []

  const images = await convertPdfToImage(pdfFilePath, {
    scale: 2
  })

  for (const image of images) {
    const fileName = `billDataExtract_${randomUUID()}.png`
    const imageFilePath = path.join(os.tmpdir(), fileName)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(imageFilePath, image)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    imageFilePaths.push(imageFilePath)
  }

  return imageFilePaths
}

type ImageFileDetails = ISizeCalculationResult & { path: string }

/**
 * Retrieves details on a list of images.
 * @param {string[]} imageFilePaths - A list of paths to image files.
 * @returns {ImageFileDetails[]} - A list of image details.
 */
export function imageFilePathsToImageFiles(
  imageFilePaths: string[]
): ImageFileDetails[] {
  const imageFiles: ImageFileDetails[] = []

  for (const imageFilePath of imageFilePaths) {
    imageFiles.push(
      Object.assign({ path: imageFilePath }, getImageSize(imageFilePath))
    )
  }

  return imageFiles
}

/**
 * Converts a percentage and pixel length into a pixel position.
 * @param {number} percentage - Between 0 and 100.
 * @param {number} length - Pixel length.
 * @returns {number} - Pixel position.
 */
export function percentageToCoordinate(
  percentage: number,
  length: number
): number {
  return Math.round((percentage / 100) * length)
}
