import { enbridgeDomain, enbridgeExtractType } from '../extracts/enbridge.js'
import { sectorflowExtractType } from '../extracts/sectorflow.js'
import { ssmpucDomain, ssmpucExtractType } from '../extracts/ssmpuc.js'

import { extractFullPageText } from './ocrUtilities.js'

type ExtractType =
  | typeof ssmpucExtractType
  | typeof enbridgeExtractType
  | typeof sectorflowExtractType

/**
 * Given a bill, suggests the recommended extract type.
 * @param {string} billPath - The bill path
 * @returns {string} - The suggested extract type.
 */
export async function getSuggestedExtractType(
  billPath: string
): Promise<ExtractType> {
  const fullText = await extractFullPageText(billPath)

  if (fullText.includes(ssmpucDomain)) {
    return ssmpucExtractType
  } else if (fullText.includes(enbridgeDomain)) {
    return enbridgeExtractType
  }

  return sectorflowExtractType
}
