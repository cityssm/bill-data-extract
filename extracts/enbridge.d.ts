import type { GasBillData } from './types.js';
export declare const enbridgeExtractType = "enbridge";
export declare const enbridgeDomain = "enbridgegas.com";
export declare function extractEnbridgeBillData(enbridgePdfPath: string): Promise<GasBillData>;
export declare function extractEnbridgeBillDataWithSectorFlow(enbridgePdfPath: string, sectorFlowApiKey: string): Promise<GasBillData>;
export declare function extractEnbridgeBillDataWithSectorFlowBackup(enbridgeBillPath: string, sectorFlowApiKey: string): Promise<GasBillData | undefined>;
export declare function isEnbridgeBill(billPath: string): Promise<boolean>;
