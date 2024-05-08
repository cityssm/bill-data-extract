import type { SectorFlow } from '@cityssm/sectorflow'

const preferredModels = ['ChatGPT']

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
