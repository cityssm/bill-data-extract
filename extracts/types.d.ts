import type { RecognizeResult as TesseractRecognizeResult } from 'tesseract.js';
export type DataExtractOptions<T> = Record<keyof T, DataField>;
export interface DataField {
    pageNumber: number;
    topLeftCoordinate: DataFieldCoordinate;
    bottomRightCoordinate: DataFieldCoordinate;
    processingFunction?: (tesseractResult: TesseractRecognizeResult) => unknown | undefined;
}
export interface DataFieldCoordinate {
    xPercentage: number;
    yPercentage: number;
}
export interface BillData extends Record<string, unknown> {
    totalAmountDue: number | undefined;
    accountNumber: string;
    dueDate: string;
}
