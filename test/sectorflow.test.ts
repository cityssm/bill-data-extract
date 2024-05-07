import assert from 'node:assert'
import { describe, it } from 'node:test'

import { extractBillDataWithSectorFlow } from '../extracts/sectorflow.js'

import { sectorFlowApiKey } from './config.js'

await describe('bill-data-extract/sectorflow', async () => {
  await it('Extracts data from a scanned PUC bill with AI', async () => {
    const data = await extractBillDataWithSectorFlow(
      'test/files/ssmpucScanned2.pdf',
      sectorFlowApiKey
    )
    console.log(data)
    assert.ok(data)
  })

  await it('Extracts data from a downloaded PUC bill with AI', async () => {
    const data = await extractBillDataWithSectorFlow(
      'test/files/ssmpucText.pdf',
      sectorFlowApiKey
    )
    console.log(data)
    assert.ok(data)
  })

  await it('Extracts data from a scanned Enbridge bill with AI', async () => {
    const data = await extractBillDataWithSectorFlow(
      'test/files/enbridgeScanned2.pdf',
      sectorFlowApiKey
    )
    console.log(data)
    assert.ok(data)
  })

  await it('Extracts data from a downloaded Enbridge bill with AI', async () => {
    const data = await extractBillDataWithSectorFlow(
      'test/files/enbridgeText.pdf',
      sectorFlowApiKey
    )
    console.log(data)
    assert.ok(data)
  })
})
