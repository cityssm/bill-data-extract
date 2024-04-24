import type { RecognizeResult as TesseractRecognizeResult } from 'tesseract.js'

export type DataExtractOptions<T> = Record<keyof T, DataField>

export interface DataField {
  pageNumber: number
  topLeftCoordinate: DataFieldCoordinate
  bottomRightCoordinate: DataFieldCoordinate
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
  totalAmountDue: number | undefined
  accountNumber: string
  dueDate: string
}
