import fs from 'node:fs/promises';
import Debug from 'debug';
import { createWorker } from 'tesseract.js';
import { imageFilePathsToImageFiles, pdfFilePathToImageFilePaths } from './utilities/imageUtilities.js';
import { percentageToCoordinate } from './utilities/mathUtilities.js';
const debug = Debug('bill-data-extract:index');
function getOCRCacheKey(options) {
    return `${options.imagePath}::${options.pageNumber}::${options.xTop}::${options.yTop}::${options.xBottom}::${options.yBottom}`;
}
export async function extractData(pdfOrImageFilePaths, extractOptions) {
    const imageFilePaths = [];
    const tempFilePaths = [];
    for (const filePath of pdfOrImageFilePaths) {
        if (filePath.toLowerCase().endsWith('.pdf')) {
            const tempImageFilePaths = await pdfFilePathToImageFilePaths(filePath);
            imageFilePaths.push(...tempImageFilePaths);
            tempFilePaths.push(...tempImageFilePaths);
        }
        else {
            imageFilePaths.push(filePath);
        }
    }
    const imageFiles = imageFilePathsToImageFiles(imageFilePaths);
    const ocrCache = {};
    const result = {};
    const worker = await createWorker();
    try {
        for (const [dataFieldName, dataFieldOptions] of Object.entries(extractOptions)) {
            const image = imageFiles[(dataFieldOptions.pageNumber ?? 1) - 1];
            const xTop = percentageToCoordinate(dataFieldOptions.topLeftCoordinate?.xPercentage ?? 0, image.width);
            const yTop = percentageToCoordinate(dataFieldOptions.topLeftCoordinate?.yPercentage ?? 0, image.height);
            const xBottom = percentageToCoordinate(dataFieldOptions.bottomRightCoordinate?.xPercentage ?? 100, image.width);
            const yBottom = percentageToCoordinate(dataFieldOptions.bottomRightCoordinate?.yPercentage ?? 100, image.height);
            const rectangle = {
                top: yTop,
                left: xTop,
                width: xBottom - xTop,
                height: yBottom - yTop
            };
            debug(`Finding "${dataFieldName}"...`);
            const ocrCacheKey = getOCRCacheKey({
                imagePath: image.path,
                pageNumber: dataFieldOptions.pageNumber ?? 1,
                xTop,
                yTop,
                xBottom,
                yBottom
            });
            let rawText = ocrCache[ocrCacheKey];
            if (rawText === undefined) {
                rawText = await worker.recognize(image.path, {
                    rectangle
                });
                ocrCache[ocrCacheKey] = rawText;
            }
            else {
                debug(`OCR Cache Hit: ${ocrCacheKey}`);
            }
            debug(`Raw Text: ${rawText.data.text}`);
            result[dataFieldName] =
                dataFieldOptions.processingFunction === undefined
                    ? rawText.data.text.trim()
                    : dataFieldOptions.processingFunction(rawText);
            debug(`${dataFieldName}: ${result[dataFieldName]}`);
        }
    }
    finally {
        await worker.terminate();
    }
    for (const tempFilePath of tempFilePaths) {
        try {
            await fs.unlink(tempFilePath);
        }
        catch (error) {
            console.log(error);
        }
    }
    return result;
}
export async function extractFullPageText(billPath, pageNumber = 1) {
    const rawData = await extractData([billPath], {
        text: {
            pageNumber
        }
    });
    return rawData.text;
}
export { getSuggestedExtractType } from './utilities/extractUtilities.js';
