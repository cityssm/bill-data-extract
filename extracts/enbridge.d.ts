import type { BillData } from './types.js';
export interface EnbridgeData extends BillData {
    gasUsage: number;
    gasUsageUnit: 'm3';
}
export declare function extractEnbridgeBillData(enbridgePdfPath: string): Promise<EnbridgeData>;
