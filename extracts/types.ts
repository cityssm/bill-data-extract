import type { RecognizeResult as TesseractRecognizeResult } from 'tesseract.js'

export type DataExtractOptions<T> = Record<keyof T, DataField>

export interface DataField {
  /** The first page number is 1. */
  pageNumber?: number

  /** Default {0, 0} */
  topLeftCoordinate?: DataFieldCoordinate

  /** Default {100, 100} */
  bottomRightCoordinate?: DataFieldCoordinate

  processingFunction?: (
    tesseractResult: TesseractRecognizeResult
  ) => unknown | undefined
}

export interface DataFieldCoordinate {
  /**
   * Between 0 and 100
   */
  xPercentage: number

  /**
   * Between 0 and 100
   */
  yPercentage: number
}

export interface BillData extends Record<string, unknown> {
  accountNumber: string
  serviceAddress: string
  totalAmountDue: number | undefined
  dueDate: string
}

export interface GasBillData extends BillData {
  gasUsage: number
  gasUsageUnit: 'm3'
}

export interface ElectricityBillData extends BillData {
  electricityUsage: number
  electricityUsageUnit: 'kWh'
}

export interface WaterBillData extends BillData {
  waterUsage: number
  waterUsageUnit: 'm3'
}
