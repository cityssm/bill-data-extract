import fs from 'node:fs/promises'

/**
 * Deletes a list of files.
 * @param {string[]} tempFilePaths - Temporary file paths to delete.
 * @returns {boolean} - True if all files were successfully deleted.
 */
export async function deleteTempFiles(
  tempFilePaths: string[]
): Promise<boolean> {
  let success = true

  for (const tempFilePath of tempFilePaths) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.unlink(tempFilePath)
    } catch (error) {
      console.log(error)
      success = false
    }
  }

  return success
}
