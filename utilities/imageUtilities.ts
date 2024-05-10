import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { imageSize as getImageSize } from 'image-size'
import { type ISizeCalculationResult } from 'image-size/dist/types/interface.js'
import { convert as convertPdfToImage } from 'pdf-img-convert'

export async function pdfOrImageFilePathsToImageFilePaths(
  pdfOrImageFilePaths: string[]
): Promise<{ imageFilePaths: string[]; tempFilePaths: string[] }> {
  const imageFilePaths: string[] = []
  const tempFilePaths: string[] = []

  for (const filePath of pdfOrImageFilePaths) {
    if (filePath.toLowerCase().endsWith('.pdf')) {
      const tempImageFilePaths = await pdfFilePathToImageFilePaths(filePath)

      imageFilePaths.push(...tempImageFilePaths)
      tempFilePaths.push(...tempImageFilePaths)
    } else {
      imageFilePaths.push(filePath)
    }
  }

  return {
    imageFilePaths,
    tempFilePaths
  }
}

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
    scale: 3
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
