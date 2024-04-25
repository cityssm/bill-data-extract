import fs from 'node:fs/promises';
import Debug from 'debug';
import { createWorker } from 'tesseract.js';
import { imageFilePathsToImageFiles, pdfFilePathToImageFilePaths, percentageToCoordinate } from './utilities.js';
const debug = Debug('bill-data-extract:index');
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
    const result = {};
    const worker = await createWorker();
    try {
        for (const [dataFieldName, dataFieldOptions] of Object.entries(extractOptions)) {
            const image = imageFiles[dataFieldOptions.pageNumber - 1];
            const xTop = percentageToCoordinate(dataFieldOptions.topLeftCoordinate.xPercentage, image.width);
            const yTop = percentageToCoordinate(dataFieldOptions.topLeftCoordinate.yPercentage, image.height);
            const xBottom = percentageToCoordinate(dataFieldOptions.bottomRightCoordinate.xPercentage, image.width);
            const yBottom = percentageToCoordinate(dataFieldOptions.bottomRightCoordinate.yPercentage, image.height);
            const rectangle = {
                top: yTop,
                left: xTop,
                width: xBottom - xTop,
                height: yBottom - yTop
            };
            debug(`Finding "${dataFieldName}"...`);
            const rawText = await worker.recognize(image.path, {
                rectangle
            });
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
