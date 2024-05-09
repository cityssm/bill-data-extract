import { SectorFlow } from '@cityssm/sectorflow';
import { dateToString } from '@cityssm/utils-datetime';
import { parse } from 'date-fns/parse';
import Debug from 'debug';
import { replaceDateStringTypos } from '../helpers/dateHelpers.js';
import { trimToNumber } from '../helpers/numberHelpers.js';
import { trimTextFromEndUntil } from '../helpers/trimmingHelpers.js';
import { extractData, extractFullPageText } from '../index.js';
import { getTemporaryProjectId } from '../utilities/sectorflowUtilities.js';
const debug = Debug('bill-data-extract:enbridge');
export const enbridgeExtractType = 'enbridge';
export const enbridgeDomain = 'enbridgegas.com';
const enbridgeDataExtractOptions = {
    accountNumber: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 53,
            yPercentage: 21
        },
        bottomRightCoordinate: {
            xPercentage: 65,
            yPercentage: 24
        },
        processingFunction(tesseractResult) {
            const textPieces = tesseractResult.data.text.trim().split('\n');
            let text = textPieces.at(-1) ?? '';
            text = text.replaceAll(' ', '');
            text = text.replaceAll(':', '2');
            text = text.replaceAll(';', '2');
            text = text.replaceAll('¢', '6');
            return text;
        }
    },
    serviceAddress: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 52,
            yPercentage: 15
        },
        bottomRightCoordinate: {
            xPercentage: 93,
            yPercentage: 21
        },
        processingFunction(tesseractResult) {
            const textLines = tesseractResult.data.text.trim().split('\n');
            return (textLines[1] ?? '').trim().replaceAll('  ', ' ');
        }
    },
    totalAmountDue: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 18,
            yPercentage: 42
        },
        bottomRightCoordinate: {
            xPercentage: 36,
            yPercentage: 47
        },
        processingFunction(tesseractResult) {
            return trimToNumber(tesseractResult.data.text);
        }
    },
    dueDate: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 21,
            yPercentage: 47
        },
        bottomRightCoordinate: {
            xPercentage: 33,
            yPercentage: 51
        },
        processingFunction(tesseractResult) {
            const textPieces = trimTextFromEndUntil(tesseractResult.data.text.trim(), /\d/).split('\n');
            const dateString = replaceDateStringTypos(textPieces.at(-1) ?? '');
            const date = parse(dateString, 'LLL dd, y', new Date());
            return dateToString(date);
        }
    },
    gasUsage: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 50,
            yPercentage: 43
        },
        bottomRightCoordinate: {
            xPercentage: 69,
            yPercentage: 52
        },
        processingFunction(tesseractResult) {
            const textLines = tesseractResult.data.text.trim().split('\n');
            for (const textLine of textLines) {
                if (/\d/.test(textLine)) {
                    return trimToNumber(textLine, false);
                }
            }
            return undefined;
        }
    }
};
export async function extractEnbridgeBillData(enbridgePdfPath) {
    const data = await extractData([enbridgePdfPath], enbridgeDataExtractOptions);
    data.gasUsageUnit = 'm3';
    return data;
}
export async function extractEnbridgeBillDataWithSectorFlow(enbridgeBillPath, sectorFlowApiKey) {
    const rawText = await extractFullPageText(enbridgeBillPath);
    const sectorFlow = new SectorFlow(sectorFlowApiKey);
    const projectId = await getTemporaryProjectId(sectorFlow);
    const response = await sectorFlow.sendChatMessage(projectId, `Given the following text, extract
    the "Account Number" as "accountNumber",
    the "Service Address" as "serviceAddress",
    the usage as "gasUsage",
    the "Total Amount" as "totalAmountDue",
    and the "Due Date" as "dueDate"
    into a JSON object.
    The "accountNumber" is in the first half of the text.
    The "accountNumber" is a text string with 12 digits separated by spaces, and starting with "9".
    The "accountNumber" is next to the bill date.
    The "accountNumber does not contain dashes.
    The "dueDate" should be formatted as "yyyy-mm-dd".
    The "gasUsage" is a number followed by "m3".
    The "totalAmountDue" is the dollar amount including taxes.
    The "totalAmountDue" and "gasUsage" should be formatted as numbers.
    
    ${rawText}`);
    const json = JSON.parse(response.choices[0].choices[0].message.content);
    await sectorFlow.deleteProject(projectId);
    json.gasUsageUnit = 'm3';
    return json;
}
export async function extractEnbridgeBillDataWithSectorFlowBackup(enbridgeBillPath, sectorFlowApiKey) {
    let billData;
    try {
        billData = await extractEnbridgeBillData(enbridgeBillPath);
    }
    catch { }
    if (billData === undefined ||
        !/^\d{12}/.test(billData.accountNumber)) {
        debug('Falling back to SectorFlow');
        billData = await extractEnbridgeBillDataWithSectorFlow(enbridgeBillPath, sectorFlowApiKey);
    }
    return billData;
}
export async function isEnbridgeBill(billPath) {
    const fullText = await extractFullPageText(billPath);
    return fullText.includes(enbridgeDomain);
}
