import { SectorFlow } from '@cityssm/sectorflow';
import { extractFullPageText } from '../utilities/ocrUtilities.js';
import { getTemporaryProjectId } from '../utilities/sectorflowUtilities.js';
export const sectorflowExtractType = 'sectorflow';
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
export async function extractBillDataWithSectorFlow(billPath, sectorFlowApiKey) {
    const rawText = await extractFullPageText(billPath);
    const sectorFlow = new SectorFlow(sectorFlowApiKey);
    const projectId = await getTemporaryProjectId(sectorFlow);
    const response = await sectorFlow.sendChatMessage(projectId, `${sectorFlowPrompt}\n\n${rawText}`);
    const json = JSON.parse(response.choices[0].choices[0].message.content);
    await sectorFlow.deleteProject(projectId);
    return json;
}
