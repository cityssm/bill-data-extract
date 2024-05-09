import type { BillData } from './types.js';
export declare const sectorflowExtractType = "sectorflow";
export declare function extractBillDataWithSectorFlow(billPath: string, sectorFlowApiKey: string): Promise<BillData>;
