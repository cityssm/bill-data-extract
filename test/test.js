import assert from 'node:assert';
import { describe, it } from 'node:test';
import { extractEnbridgeBillData } from '../extracts/enbridge.js';
import { extractSSMPUCBillData } from '../extracts/ssmpuc.js';
await describe('bill-data-extract/enbridge', async () => {
    await it.skip('Extracts data from a scanned Enbridge bill', async () => {
        const data = await extractEnbridgeBillData('test/files/enbridgeScanned.pdf');
        console.log(data);
        assert.ok(data);
    });
    await it.skip('Extracts data from a downloaded Enbridge bill', async () => {
        const data = await extractEnbridgeBillData('test/files/enbridgeText.pdf');
        console.log(data);
        assert.ok(data);
    });
});
await describe('bill-data-extract/ssmpuc', async () => {
    await it('Extracts data from a scanned PUC bill', async () => {
        const data = await extractSSMPUCBillData('test/files/ssmpucScanned.pdf');
        console.log(data);
        assert.ok(data);
    });
    await it('Extracts data from a downloaded PUC bill', async () => {
        const data = await extractSSMPUCBillData('test/files/ssmpucText.pdf');
        console.log(data);
        assert.ok(data);
    });
});
