const preferredModels = ['ChatGPT 3.5', 'Claude 3 Haiku'];
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
export function findAndParseJSON(contentString) {
    let cleanContentString = contentString.trim();
    while (cleanContentString.length > 0 && cleanContentString.at(0) !== '{') {
        cleanContentString = cleanContentString.slice(1);
    }
    while (cleanContentString.length > 0 && cleanContentString.at(-1) !== '}') {
        cleanContentString = cleanContentString.slice(0, -1);
    }
    return JSON.parse(cleanContentString);
}
