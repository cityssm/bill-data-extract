import { cleanNumberText, trimToNumber } from '../helpers/numbers.js';
import { extractData } from '../index.js';
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
            return textPieces.at(-1) ?? '';
        }
    },
    electricityUsageMetered: {
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
            xPercentage: 85,
            yPercentage: 47
        },
        processingFunction(tesseractResult) {
            return extractLastNumberInRow('E', tesseractResult);
        }
    },
    waterUsageMetered: {
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
