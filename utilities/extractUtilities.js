import { enbridgeDomain, enbridgeExtractType } from '../extracts/enbridge.js';
import { sectorflowExtractType } from '../extracts/sectorflow.js';
import { ssmpucDomain, ssmpucExtractType } from '../extracts/ssmpuc.js';
import { extractFullPageText } from '../index.js';
export async function getSuggestedExtractType(billPath) {
    const fullText = await extractFullPageText(billPath);
    if (fullText.includes(ssmpucDomain)) {
        return ssmpucExtractType;
    }
    else if (fullText.includes(enbridgeDomain)) {
        return enbridgeExtractType;
    }
    return sectorflowExtractType;
}
