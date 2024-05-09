import assert from 'node:assert';
import { describe, it } from 'node:test';
import { enbridgeExtractType } from '../extracts/enbridge.js';
import { ssmpucExtractType } from '../extracts/ssmpuc.js';
import { getSuggestedExtractType } from '../utilities/extractUtilities.js';
import { enbridgeFiles, ssmpucFiles } from './config.js';
await describe('bill-data-extract/extractUtilities', async () => {
    for (const testFile of Object.keys(enbridgeFiles)) {
        await it(`Identifies Enbridge bill: ${testFile}`, async () => {
            const extractType = await getSuggestedExtractType(`test/files/${testFile}`);
            assert.strictEqual(extractType, enbridgeExtractType);
        });
    }
    for (const testFile of Object.keys(ssmpucFiles)) {
        await it(`Identifies SSM PUC bill: ${testFile}`, async () => {
            const extractType = await getSuggestedExtractType(`test/files/${testFile}`);
            assert.strictEqual(extractType, ssmpucExtractType);
        });
    }
});
