import Debug from 'debug';
import { createWorker } from 'tesseract.js';
import { deleteTempFiles } from './utilities/fileUtilities.js';
import { imageFilePathsToImageFiles, pdfOrImageFilePathsToImageFilePaths } from './utilities/imageUtilities.js';
import { percentageToCoordinate } from './utilities/mathUtilities.js';
const debug = Debug('bill-data-extract:index');
function getOCRCacheKey(options) {
    return `${options.imagePath}::${options.pageNumber}::${options.xTop}::${options.yTop}::${options.xBottom}::${options.yBottom}`;
}
export async function extractData(pdfOrImageFilePaths, extractOptions) {
    const { imageFilePaths, tempFilePaths } = await pdfOrImageFilePathsToImageFilePaths(pdfOrImageFilePaths);
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
                width: xBottom - xTop - 1,
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
    await deleteTempFiles(tempFilePaths);
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
