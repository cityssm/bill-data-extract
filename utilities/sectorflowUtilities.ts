import type { SectorFlow } from '@cityssm/sectorflow'

const preferredModels = ['ChatGPT 3.5', 'Claude 3 Haiku']

let preferredModelId = ''

/**
 * Creates a new SectorFlow project with a preferred model.
 * @param {SectorFlow} sectorFlow - An initialize SectorFlow object.
 * @returns {string} - A new project id.
 */
export async function getTemporaryProjectId(
  sectorFlow: SectorFlow
): Promise<string> {
  if (preferredModelId === '') {
    for (const preferredModel of preferredModels) {
      preferredModelId =
        (await sectorFlow.getModelIdByKeywords(preferredModel)) ?? ''

      if (preferredModelId !== '') {
        break
      }
    }

    if (preferredModelId === '') {
      throw new Error('No preferred models available.')
    }
  }

  /*
   * Create temp project.
   */

  const project = await sectorFlow.createProject({
    modelIds: [preferredModelId],
    name: `@cityssm/bill-data-extract temp project - ${Date.now()}`,
    chatHistoryType: 'USER',
    contextType: 'PRIVATE',
    sharingType: 'PRIVATE'
  })

  return project.id
}

/**
 * Finds a JSON object within a string, and parses it.
 * @param {string} contentString - A text string, possibly with text on either side of the JSON.
 * @returns {object} - A parsed object.
 */
export function findAndParseJSON(contentString: string): object {
  let cleanContentString = contentString.trim()

  // Remove first character until {
  while (cleanContentString.length > 0 && cleanContentString.at(0) !== '{') {
    cleanContentString = cleanContentString.slice(1)
  }

  while (cleanContentString.length > 0 && cleanContentString.at(-1) !== '}') {
    cleanContentString = cleanContentString.slice(0, -1)
  }

  return JSON.parse(cleanContentString)
}
