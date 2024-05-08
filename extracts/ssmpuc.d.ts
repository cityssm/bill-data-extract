import type { BillData } from './types.js';
export interface SSMPUCData extends BillData {
    waterUsageMetered: number | undefined;
    waterUsageBilled: number | undefined;
    waterUsageUnit: 'm3';
    electricityUsageMetered: number | undefined;
    electricityUsageBilled: number | undefined;
    electricityUsageUnit: 'kWh';
}
export declare function extractSSMPUCBillData(ssmpucBillPath: string): Promise<SSMPUCData>;
export declare function extractSSMPUCBillDataWithSectorFlow(ssmpucBillPath: string, sectorFlowApiKey: string): Promise<SSMPUCData>;
export declare function extractSSMPUCBillDataWithSectorFlowBackup(ssmpucBillPath: string, sectorFlowApiKey: string): Promise<SSMPUCData | undefined>;
