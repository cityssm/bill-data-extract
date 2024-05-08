const preferredModels = ['ChatGPT'];
let preferredModelId = '';
export async function getTemporaryProjectId(sectorFlow) {
    if (preferredModelId === '') {
        for (const preferredModel of preferredModels) {
            preferredModelId =
                (await sectorFlow.getModelIdByKeywords(preferredModel)) ?? '';
            if (preferredModelId !== '') {
                break;
            }
        }
        if (preferredModelId === '') {
            throw new Error('No preferred models available.');
        }
    }
    const project = await sectorFlow.createProject({
        modelIds: [preferredModelId],
        name: `@cityssm/bill-data-extract temp project - ${Date.now()}`,
        chatHistoryType: 'USER',
        contextType: 'PRIVATE',
        sharingType: 'PRIVATE'
    });
    return project.id;
}
