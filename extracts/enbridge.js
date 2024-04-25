import { trimToNumber } from '../helpers/numbers.js';
import { trimTextFromEndUntil } from '../helpers/trimmers.js';
import { extractData } from '../index.js';
const enbridgeDataExtractOptions = {
    accountNumber: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 53,
            yPercentage: 21
        },
        bottomRightCoordinate: {
            xPercentage: 63,
            yPercentage: 24
        },
        processingFunction(tesseractResult) {
            const textPieces = tesseractResult.data.text.trim().split('\n');
            let text = textPieces.at(-1) ?? '';
            text = text.replaceAll(' ', '');
            text = text.replaceAll('¢', '6');
            return text;
        }
    },
    usage: {
        pageNumber: 1,
        topLeftCoordinate: {
            xPercentage: 50.5,
            yPercentage: 46
        },
        bottomRightCoordinate: {
            xPercentage: 68,
            yPercentage: 49
        },
        processingFunction(tesseractResult) {
            let text = tesseractResult.data.text.trim();
            text = trimTextFromEndUntil(text, /m/);
            text = text.replaceAll(',', '');
            text = text.slice(0, -1);
            return Number.parseInt(text);
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
            let text = trimTextFromEndUntil(tesseractResult.data.text.trim(), /\d/);
            const textPieces = text.split('\n');
            text = textPieces.at(-1) ?? '';
            return text;
        }
    }
};
export async function extractEnbridgeBillData(enbridgePdfPath) {
    const data = await extractData([enbridgePdfPath], enbridgeDataExtractOptions);
    data.usageUnit = 'm3';
    return data;
}
