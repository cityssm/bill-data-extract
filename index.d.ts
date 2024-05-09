import type { DataExtractOptions } from './extracts/types.js';
export declare function extractData<T extends Record<string, unknown>>(pdfOrImageFilePaths: string[], extractOptions: DataExtractOptions<T>): Promise<T>;
export { getSuggestedExtractType } from './utilities/extractUtilities.js';
export { extractFullPageText } from './utilities/ocrUtilities.js';
export type { DataExtractOptions, DataField, DataFieldCoordinate, BillData, GasBillData, ElectricityBillData, WaterBillData } from './extracts/types.js';
