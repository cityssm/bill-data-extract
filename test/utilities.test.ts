import assert from 'node:assert'
import { describe, it } from 'node:test'

import { enbridgeExtractType } from '../extracts/enbridge.js'
import { ssmpucExtractType } from '../extracts/ssmpuc.js'
import { getSuggestedExtractType } from '../utilities/extractUtilities.js'
import { findAndParseJSON } from '../utilities/sectorflowUtilities.js'

import { enbridgeFiles, ssmpucFiles } from './config.js'

await describe('bill-data-extract/extractUtilities', async () => {
  for (const testFile of Object.keys(enbridgeFiles)) {
    await it(`Identifies Enbridge bill: ${testFile}`, async () => {
      const extractType = await getSuggestedExtractType(
        `test/files/${testFile}`
      )

      assert.strictEqual(extractType, enbridgeExtractType)
    })
  }

  for (const testFile of Object.keys(ssmpucFiles)) {
    await it(`Identifies SSM PUC bill: ${testFile}`, async () => {
      const extractType = await getSuggestedExtractType(
        `test/files/${testFile}`
      )

      assert.strictEqual(extractType, ssmpucExtractType)
    })
  }
})

await describe('bill-data-extract/sectorflowUtilities', async () => {
  await it('Parses content that is just JSON', async () => {
    const json = findAndParseJSON('{"number": 1}') as { number: number }

    assert(json)
    assert(json.number)
  })

  await it('Parses content that surrounds JSON', async () => {
    const json = findAndParseJSON('The answer is {"number": 1} <.>') as {
      number: number
    }

    assert(json)
    assert(json.number)
  })
})
