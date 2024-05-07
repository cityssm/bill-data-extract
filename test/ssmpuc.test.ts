import assert from 'node:assert'
import { describe, it } from 'node:test'

import { extractSSMPUCBillData } from '../extracts/ssmpuc.js'

import { ssmpucFiles } from './config.js'

await describe('bill-data-extract/ssmpuc', async () => {
  for (const [testFile, expectedOutput] of Object.entries(ssmpucFiles)) {
    await it(`Extracts data: ${testFile}`, async () => {
      const data = await extractSSMPUCBillData(`test/files/${testFile}`)

      console.log(data)
      assert.ok(data)

      assert.strictEqual(data.accountNumber, expectedOutput.accountNumber)
      assert.ok(data.serviceAddress?.startsWith(expectedOutput.serviceAddress))
      assert.strictEqual(data.totalAmountDue, expectedOutput.totalAmountDue)
      assert.strictEqual(data.electricityUsageMetered, expectedOutput.electricityUsageMetered)
      assert.strictEqual(data.waterUsageMetered, expectedOutput.waterUsageMetered)
    })
  }
})
