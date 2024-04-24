import { type ISizeCalculationResult } from 'image-size/dist/types/interface.js';
export declare function pdfFilePathToImageFilePaths(pdfFilePath: string): Promise<string[]>;
type ImageFileDetails = ISizeCalculationResult & {
    path: string;
};
export declare function imageFilePathsToImageFiles(imageFilePaths: string[]): ImageFileDetails[];
export declare function percentageToCoordinate(percentage: number, length: number): number;
export {};
