import assert from 'node:assert'
import { describe, it } from 'node:test'

import { extractSSMPUCBillData } from '../extracts/ssmpuc.js'

await describe('bill-data-extract/ssmpuc', async () => {
  await it('Extracts data from a scanned PUC bill', async () => {
    const data = await extractSSMPUCBillData('test/files/ssmpucScanned2.pdf')
    console.log(data)
    assert.ok(data)
  })

  await it('Extracts data from a downloaded PUC bill', async () => {
    const data = await extractSSMPUCBillData('test/files/ssmpucText.pdf')
    console.log(data)
    assert.ok(data)
  })
})
