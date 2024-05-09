import type { ElectricityBillData, GasBillData, WaterBillData } from './types.js';
export declare const sectorflowExtractType = "sectorflow";
interface SectorFlowBillData extends Partial<GasBillData>, Partial<ElectricityBillData>, Partial<WaterBillData> {
}
export declare function extractBillDataWithSectorFlow(billPath: string, sectorFlowApiKey: string): Promise<SectorFlowBillData>;
export {};
