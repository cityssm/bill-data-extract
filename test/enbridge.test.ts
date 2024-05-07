import assert from 'node:assert'
import { describe, it } from 'node:test'

import { extractEnbridgeBillData } from '../extracts/enbridge.js'

import { enbridgeFiles } from './config.js'

await describe('bill-data-extract/enbridge', async () => {
  for (const [testFile, expectedOutput] of Object.entries(enbridgeFiles)) {
    await it(`Extracts data: ${testFile}`, async () => {
      const data = await extractEnbridgeBillData(`test/files/${testFile}`)

      console.log(data)
      assert.ok(data)

      assert.strictEqual(data.accountNumber, expectedOutput.accountNumber)
      assert.ok(data.serviceAddress.startsWith(expectedOutput.serviceAddress))
      assert.strictEqual(data.totalAmountDue, expectedOutput.totalAmountDue)
      assert.strictEqual(data.gasUsage, expectedOutput.gasUsage)
    })
  }
})
