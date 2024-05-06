import type { RecognizeResult as TesseractRecognizeResult } from 'tesseract.js'

export type DataExtractOptions<T> = Record<keyof T, DataField>

export interface DataField {
  pageNumber: number

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
  totalAmountDue: number | undefined
  dueDate: string
}
