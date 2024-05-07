import type { BillData } from './types.js';
export interface EnbridgeData extends BillData {
    serviceAddress: string;
    gasUsage: number;
    gasUsageUnit: 'm3';
}
export declare function extractEnbridgeBillData(enbridgePdfPath: string): Promise<EnbridgeData>;
