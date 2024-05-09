import assert from 'node:assert';
import { describe, it } from 'node:test';
import { extractEnbridgeBillDataWithSectorFlowBackup } from '../extracts/enbridge.js';
import { enbridgeFiles, sectorFlowApiKey } from './config.js';
await describe('bill-data-extract/enbridge', async () => {
    for (const [testFile, expectedOutput] of Object.entries(enbridgeFiles)) {
        await it(`Extracts data: ${testFile}`, async () => {
            const data = await extractEnbridgeBillDataWithSectorFlowBackup(`test/files/${testFile}`, sectorFlowApiKey);
            console.log(data);
            assert.ok(data);
            assert.strictEqual(data.accountNumber, expectedOutput.accountNumber);
            assert.strictEqual(data.dueDate, expectedOutput.dueDate);
            assert.ok(data.serviceAddress.startsWith(expectedOutput.serviceAddress));
            assert.strictEqual(data.totalAmountDue, expectedOutput.totalAmountDue);
            assert.strictEqual(data.gasUsage, expectedOutput.gasUsage);
        });
    }
});
