import assert from 'node:assert'
import { describe, it } from 'node:test'

import { extractSSMPUCBillDataWithSectorFlowBackup } from '../extracts/ssmpuc.js'

import { sectorFlowApiKey, ssmpucFiles } from './config.js'

await describe('bill-data-extract/ssmpuc', async () => {
  for (const [testFile, expectedOutput] of Object.entries(ssmpucFiles)) {
    await it(`Extracts data: ${testFile}`, async () => {
      const data = await extractSSMPUCBillDataWithSectorFlowBackup(
        `test/files/${testFile}`,
        sectorFlowApiKey
      )

      console.log(data)
      assert.ok(data)

      assert.strictEqual(data.accountNumber, expectedOutput.accountNumber)
      assert.strictEqual(data.dueDate, expectedOutput.dueDate)
      assert.ok(data.serviceAddress?.startsWith(expectedOutput.serviceAddress))
      assert.strictEqual(data.totalAmountDue, expectedOutput.totalAmountDue)

      assert.strictEqual(
        data.electricityUsageMetered,
        expectedOutput.electricityUsageMetered
      )

      assert.strictEqual(
        data.electricityUsageBilled,
        expectedOutput.electricityUsageBilled
      )

      assert.strictEqual(
        data.waterUsageMetered,
        expectedOutput.waterUsageMetered
      )

      assert.strictEqual(data.waterUsageBilled, expectedOutput.waterUsageBilled)
    })
  }
})
