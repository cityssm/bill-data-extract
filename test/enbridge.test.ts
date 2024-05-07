import assert from 'node:assert'
import { describe, it } from 'node:test'

import { extractEnbridgeBillData } from '../extracts/enbridge.js'

import { enbridgeFiles } from './config.js'

await describe('bill-data-extract/enbridge', async () => {
  for (const [testFile, expectedOutput] of Object.entries(enbridgeFiles)) {
    await it(`Extracts data: ${testFile}`, async () => {
      const data = await extractEnbridgeBillData(`test/files/${testFile}`)

      assert.ok(data)

      assert.strictEqual(data.totalAmountDue, expectedOutput.totalAmountDue)
      assert.strictEqual(data.gasUsage, expectedOutput.gasUsage)
    })
  }
})
