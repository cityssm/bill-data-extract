import { enbridgeExtractType } from '../extracts/enbridge.js';
import { sectorflowExtractType } from '../extracts/sectorflow.js';
import { ssmpucExtractType } from '../extracts/ssmpuc.js';
type ExtractType = typeof ssmpucExtractType | typeof enbridgeExtractType | typeof sectorflowExtractType;
export declare function getSuggestedExtractType(billPath: string): Promise<ExtractType>;
export {};
