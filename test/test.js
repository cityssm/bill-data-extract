import assert from 'node:assert';
import { describe, it } from 'node:test';
import { extractEnbridgeBillData } from '../extracts/enbridge.js';
await describe('bill-data-extract/enbridge', async () => {
    await it('Extracts data from a scanned Enbridge bill', async () => {
        const data = await extractEnbridgeBillData('test/files/enbridgeScanned.pdf');
        console.log(data);
        assert.ok(data);
    });
    await it('Extracts data from a downloaded Enbridge bill', async () => {
        const data = await extractEnbridgeBillData('test/files/enbridgeText.pdf');
        console.log(data);
        assert.ok(data);
    });
});
