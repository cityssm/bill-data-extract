import type { BillData } from './types.js';
export declare const ssmpucExtractType = "ssmpuc";
export declare const ssmpucDomain = "ssmpuc.com";
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
export declare function isSSMPUCBill(billPath: string): Promise<boolean>;
