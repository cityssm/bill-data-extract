import type { BillData } from './types.js';
export interface EnbridgeData extends BillData {
    usage: number;
    usageUnit: 'm3';
}
export declare function extractEnbridgeBillData(enbridgePdfPath: string): Promise<EnbridgeData>;
