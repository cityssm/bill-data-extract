import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { imageSize as getImageSize } from 'image-size';
import { convert as convertPdfToImage } from 'pdf-img-convert';
export async function pdfOrImageFilePathsToImageFilePaths(pdfOrImageFilePaths) {
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
    return {
        imageFilePaths,
        tempFilePaths
    };
}
export async function pdfFilePathToImageFilePaths(pdfFilePath) {
    const imageFilePaths = [];
    const images = await convertPdfToImage(pdfFilePath, {
        scale: 3
    });
    for (const image of images) {
        const fileName = `billDataExtract_${randomUUID()}.png`;
        const imageFilePath = path.join(os.tmpdir(), fileName);
        await fs.writeFile(imageFilePath, image);
        imageFilePaths.push(imageFilePath);
    }
    return imageFilePaths;
}
export function imageFilePathsToImageFiles(imageFilePaths) {
    const imageFiles = [];
    for (const imageFilePath of imageFilePaths) {
        imageFiles.push(Object.assign({ path: imageFilePath }, getImageSize(imageFilePath)));
    }
    return imageFiles;
}
