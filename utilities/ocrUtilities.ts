import { extractData } from '../index.js'

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
