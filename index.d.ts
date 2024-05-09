import type { DataExtractOptions } from './extracts/types.js';
export declare function extractData<T extends Record<string, unknown>>(pdfOrImageFilePaths: string[], extractOptions: DataExtractOptions<T>): Promise<T>;
export { getSuggestedExtractType } from './utilities/extractUtilities.js';
export type { BillData, DataExtractOptions, DataField, DataFieldCoordinate, GasBillData } from './extracts/types.js';
