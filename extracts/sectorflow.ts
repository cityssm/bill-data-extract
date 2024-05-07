// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import { SectorFlow } from '@cityssm/sectorflow'

import { extractData } from '../index.js'

import type { BillData, DataExtractOptions } from './types.js'

const preferredModels = ['ChatGPT']

const sectorFlowPrompt = `Given the following text, extract the "account number" as "accountNumber", the "service address" as "serviceAddress", the "total amount due" as "totalAmountDue", and the "due date" as "dueDate" into a JSON object.
The "totalAmountDue" should be formatted as a number.
The "dueDate" should be formatted as "yyyy-mm-dd".
If the text represents a gas bill, include
the "gas usage" as "gasUsage",
and the unit of measure for the gas usage (likely m3) as "gasUsageUnit".
If the text represents a utility bill, include
the "electricity usage" as "electricityUsage",
the unit of measure for the electricity usage (likely kWh) as "electricityUsageUnit",
the "water usage" as "waterUsage"
and the unit of measure for the water usage (likely m3 or cu. metre) as "waterUsageUnit".`

interface SectorFlowBillData extends BillData {
  gasUsage?: number
  gasUsageUnit?: string

  waterUsage?: number | undefined
  waterUsageUnit?: string

  electricityUsage?: number | undefined
  electricityUsageUnit?: string
}

const sectorFlowDataExtractOptions: DataExtractOptions<
  Partial<SectorFlowBillData>
> = {
  accountNumber: {},
  serviceAddress: {},
  totalAmountDue: {},
  dueDate: {},
  gasUsage: {},
  gasUsageUnit: {},
  waterUsage: {},
  waterUsageUnit: {},
  electricityUsage: {},
  electricityUsageUnit: {}
}

/**
 * Extracts data from a bill using SecotrFlow's AI platform.
 * @param {string} billPath - Path to the bill.
 * @param {string} sectorFlowApiKey - SectorFlow API key.
 * @returns {Promise<SectorFlowBillData>} - Bill data.
 */
export async function extractBillDataWithSectorFlow(
  billPath: string,
  sectorFlowApiKey: string
): Promise<BillData> {
  /*
   * Run OCR
   */

  const rawData = await extractData([billPath], sectorFlowDataExtractOptions)

  /*
   * Get model from SectorFlow
   */

  const sectorFlow = new SectorFlow(sectorFlowApiKey)

  let modelId: string = ''

  for (const preferredModel of preferredModels) {
    modelId = (await sectorFlow.getModelIdByKeywords(preferredModel)) ?? ''

    if (modelId !== '') {
      break
    }
  }

  if (modelId === '') {
    throw new Error('No preferred models available.')
  }

  /*
   * Create temp project.
   */

  const project = await sectorFlow.createProject({
    modelIds: [modelId],
    name: `@cityssm/bill-data-extract temp project - ${Date.now()}`,
    chatHistoryType: 'USER',
    contextType: 'PRIVATE',
    sharingType: 'PRIVATE'
  })

  const response = await sectorFlow.sendChatMessage(
    project.id,
    `${sectorFlowPrompt}\n\n${rawData.accountNumber ?? ''}`
  )

  const json = JSON.parse(response.choices[0].choices[0].message.content)

  /*
   * Clean up project.
   */

  await sectorFlow.deleteProject(project.id)

  return json
}
