import { SectorFlow } from '@cityssm/sectorflow';
import { extractData } from '../index.js';
const preferredModels = ['ChatGPT'];
const sectorFlowPrompt = `Given the following text, extract the "account number" as "accountNumber", the "service address" as "serviceAddress", the "total amount due" as "totalAmountDue", and the "due date" as "dueDate" into a JSON object.
The "totalAmountDue" should be formatted as a number.
The "dueDate" should be formatted as "yyyy-mm-dd".
If the text represents a gas bill, include
the "gas usage" as "gasUsage",
and the unit of measure for the gas usage (likely m3) as "gasUsageUnit".
If the text represents a utility bill, include
the "electricity usage" as "electricityUsage",
the unit of measure for the electricity usage (likely kWh) as "electricityUsageUnit",
the "water usage" as "waterUsage"
and the unit of measure for the water usage (likely m3 or cu. metre) as "waterUsageUnit".`;
const sectorFlowDataExtractOptions = {
    accountNumber: {},
    serviceAddress: {},
    totalAmountDue: {},
    dueDate: {},
    gasUsage: {},
    gasUsageUnit: {},
    waterUsage: {},
    waterUsageUnit: {},
    electricityUsage: {},
    electricityUsageUnit: {}
};
export async function extractBillDataWithSectorFlow(billPath, sectorFlowApiKey) {
    const rawData = await extractData([billPath], sectorFlowDataExtractOptions);
    const sectorFlow = new SectorFlow(sectorFlowApiKey);
    let modelId = '';
    for (const preferredModel of preferredModels) {
        modelId = (await sectorFlow.getModelIdByKeywords(preferredModel)) ?? '';
        if (modelId !== '') {
            break;
        }
    }
    if (modelId === '') {
        throw new Error('No preferred models available.');
    }
    const project = await sectorFlow.createProject({
        modelIds: [modelId],
        name: `@cityssm/bill-data-extract temp project - ${Date.now()}`,
        chatHistoryType: 'USER',
        contextType: 'PRIVATE',
        sharingType: 'PRIVATE'
    });
    const response = await sectorFlow.sendChatMessage(project.id, `${sectorFlowPrompt}\n\n${rawData.accountNumber ?? ''}`);
    const json = JSON.parse(response.choices[0].choices[0].message.content);
    await sectorFlow.deleteProject(project.id);
    return json;
}
