import assert from 'node:assert'
import { describe, it } from 'node:test'

import { extractEnbridgeBillData } from '../extracts/enbridge.js'
import { extractBillDataWithSectorFlow } from '../extracts/sectorflow.js'
import { extractSSMPUCBillData } from '../extracts/ssmpuc.js'

import { sectorFlowApiKey } from './config.js'

await describe('bill-data-extract/enbridge', async () => {
  await it('Extracts data from a scanned Enbridge bill', async () => {
    const data = await extractEnbridgeBillData(
      'test/files/enbridgeScanned2.pdf'
    )
    console.log(data)
    assert.ok(data)
  })

  await it('Extracts data from a downloaded Enbridge bill', async () => {
    const data = await extractEnbridgeBillData('test/files/enbridgeText.pdf')
    console.log(data)
    assert.ok(data)
  })
})

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
