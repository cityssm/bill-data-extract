import { SectorFlow } from '@cityssm/sectorflow';
import { dateToString } from '@cityssm/utils-datetime';
import { parse } from 'date-fns/parse';
import Debug from 'debug';
import { replaceDateStringTypos } from '../helpers/dateHelpers.js';
import { cleanNumberText, trimToNumber } from '../helpers/numberHelpers.js';
import { extractData, extractFullPageText } from '../index.js';
import { getTemporaryProjectId } from '../utilities/sectorflowUtilities.js';
const debug = Debug('bill-data-extract:ssmpuc');
export const ssmpucExtractType = 'ssmpuc';
export const ssmpucDomain = 'ssmpuc.com';
const ssmpucDataExtractOptions = {
    accountNumber: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 79,
            yPercentage: 5
        },
        bottomRightCoordinate: {
            xPercentage: 95,
            yPercentage: 9
        },
        processingFunction(tesseractResult) {
            const textPieces = tesseractResult.data.text.trim().split('\n');
            return textPieces.at(-1) ?? '';
        }
    },
    serviceAddress: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 54.6,
            yPercentage: 10.7
        },
        bottomRightCoordinate: {
            xPercentage: 80.8,
            yPercentage: 16.5
        },
        processingFunction(tesseractResult) {
            const textPieces = tesseractResult.data.text.trim().split('\n');
            return (textPieces.at(-1) ?? '').trim();
        }
    },
    totalAmountDue: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 61.75,
            yPercentage: 87.75
        },
        bottomRightCoordinate: {
            xPercentage: 74,
            yPercentage: 91
        },
        processingFunction(tesseractResult) {
            return trimToNumber(tesseractResult.data.text);
        }
    },
    dueDate: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 48,
            yPercentage: 87.75
        },
        bottomRightCoordinate: {
            xPercentage: 61,
            yPercentage: 91
        },
        processingFunction(tesseractResult) {
            const textPieces = tesseractResult.data.text.trim().split('\n');
            const dateString = replaceDateStringTypos(textPieces.at(-1) ?? '');
            const date = parse(dateString, 'LLL dd y', new Date());
            return dateToString(date);
        }
    },
    electricityUsage: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 2.5,
            yPercentage: 36.5
        },
        bottomRightCoordinate: {
            xPercentage: 77,
            yPercentage: 47
        },
        processingFunction(tesseractResult) {
            return extractLastNumberInRow('E', tesseractResult);
        }
    },
    electricityUsageBilled: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 2.5,
            yPercentage: 36.5
        },
        bottomRightCoordinate: {
            xPercentage: 85.5,
            yPercentage: 47
        },
        processingFunction(tesseractResult) {
            return extractLastNumberInRow('E', tesseractResult);
        }
    },
    waterUsage: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 2.5,
            yPercentage: 36.5
        },
        bottomRightCoordinate: {
            xPercentage: 77,
            yPercentage: 47
        },
        processingFunction(tesseractResult) {
            return extractLastNumberInRow('W', tesseractResult);
        }
    },
    waterUsageBilled: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 2.5,
            yPercentage: 36.5
        },
        bottomRightCoordinate: {
            xPercentage: 85,
            yPercentage: 47
        },
        processingFunction(tesseractResult) {
            return extractLastNumberInRow('W', tesseractResult);
        }
    }
};
function extractLastNumberInRow(meterType, tesseractResult) {
    const textRows = tesseractResult.data.text.trim().split('\n');
    for (const textRow of textRows) {
        if (textRow.trim().startsWith(`${meterType} `)) {
            const textPieces = textRow.trim().split(' ');
            return cleanNumberText(textPieces.at(-1) ?? '', false);
        }
    }
    return undefined;
}
export async function extractSSMPUCBillData(ssmpucBillPath) {
    const data = await extractData([ssmpucBillPath], ssmpucDataExtractOptions);
    data.waterUsageUnit = 'm3';
    data.electricityUsageUnit = 'kWh';
    return data;
}
export async function extractSSMPUCBillDataWithSectorFlow(ssmpucBillPath, sectorFlowApiKey) {
    const rawText = await extractFullPageText(ssmpucBillPath);
    const sectorFlow = new SectorFlow(sectorFlowApiKey);
    const projectId = await getTemporaryProjectId(sectorFlow);
    const response = await sectorFlow.sendChatMessage(projectId, `Given the following text, extract
    the "Account Number" as "accountNumber",
    the "Service Address" as "serviceAddress",
    the electric metered usage as "electricityUsage",
    the electric billed usage as "electricityUsageBilled",
    the water metered usage as "waterUsage",
    the water billed usage as "waterUsageBilled",
    the "Amount Due" as "totalAmountDue",
    and the "Due Date" as "dueDate"
    into a JSON object.
    The "accountNumber" is a text string with 7 digits, a dash, and two more digits.
    The "dueDate" should be formatted as "yyyy-mm-dd".
    The "totalAmountDue", 
    "electricityUsage", "electricityUsageBilled",
    "waterUsage", and "waterUsageBilled",
    should be formatted as numbers.

    The "electricityUsageBilled" is in a row of text starting with the letter "E".
    The "electricityUsageBilled" is the number right before "kWh"
    and is greater than or equal to the "electricityUsage".
    
    The "electricityUsage" is the sum of first numbers after "Off Peak Winter", "Mid Peak Winter", and "On Peak Winter" usage
    and is equal to a number next to the "electricityUsageBilled".
    
    The "waterUsage" and "waterUsageBilled" are in a row of text starting with the letter "W".
    The "waterUsageBilled" is the number right before "cu.metre",
    The "waterUsage" and "waterUsageBilled" are equal.
    If there is no value for "Water Consumption", the "waterUsage" and the "waterUsageBilled" should be 0.
    
    ${rawText}`);
    const json = JSON.parse(response.choices[0].choices[0].message.content);
    await sectorFlow.deleteProject(projectId);
    json.waterUsageUnit = 'm3';
    json.electricityUsageUnit = 'kWh';
    return json;
}
export async function extractSSMPUCBillDataWithSectorFlowBackup(ssmpucBillPath, sectorFlowApiKey) {
    let billData;
    try {
        billData = await extractSSMPUCBillData(ssmpucBillPath);
    }
    catch {
    }
    if (billData === undefined ||
        !/^\d{7}/.test(billData.accountNumber) ||
        (billData.electricityUsage ?? 0) > (billData.electricityUsageBilled ?? 0) ||
        (billData.waterUsage ?? 0) > (billData.waterUsageBilled ?? 0)) {
        debug('Falling back to SectorFlow');
        billData = await extractSSMPUCBillDataWithSectorFlow(ssmpucBillPath, sectorFlowApiKey);
    }
    return billData;
}
export async function isSSMPUCBill(billPath) {
    const fullText = await extractFullPageText(billPath);
    return fullText.includes(ssmpucDomain);
}
