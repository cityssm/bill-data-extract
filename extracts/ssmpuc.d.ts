import type { ElectricityBillData, WaterBillData } from './types.js';
export declare const ssmpucExtractType = "ssmpuc";
export declare const ssmpucDomain = "ssmpuc.com";
export interface SSMPUCData extends ElectricityBillData, WaterBillData {
    waterUsageBilled: number | undefined;
    electricityUsageBilled: number | undefined;
}
export declare function extractSSMPUCBillData(ssmpucBillPath: string): Promise<SSMPUCData>;
export declare function extractSSMPUCBillDataWithSectorFlow(ssmpucBillPath: string, sectorFlowApiKey: string): Promise<SSMPUCData>;
export declare function extractSSMPUCBillDataWithSectorFlowBackup(ssmpucBillPath: string, sectorFlowApiKey: string): Promise<SSMPUCData | undefined>;
export declare function isSSMPUCBill(billPath: string): Promise<boolean>;
