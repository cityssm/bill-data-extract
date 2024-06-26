import { type ISizeCalculationResult } from 'image-size/dist/types/interface.js';
export declare function pdfOrImageFilePathsToImageFilePaths(pdfOrImageFilePaths: string[]): Promise<{
    imageFilePaths: string[];
    tempFilePaths: string[];
}>;
export declare function pdfFilePathToImageFilePaths(pdfFilePath: string): Promise<string[]>;
type ImageFileDetails = ISizeCalculationResult & {
    path: string;
};
export declare function imageFilePathsToImageFiles(imageFilePaths: string[]): ImageFileDetails[];
export {};
