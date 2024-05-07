import { trimTextFromEndUntil, trimTextFromStartUntil } from './trimmers.js'

// eslint-disable-next-line no-secrets/no-secrets
/**
 * Extracts a number from a text string.
 * @param {string} rawText - Raw text string.
 * @param {boolean} isMoneyWithTwoDecimalPlaces - Whether or not there should be two decimal places.
 * @returns {number} - Extracted number.
 */
export function trimToNumber(
  rawText: string,
  isMoneyWithTwoDecimalPlaces: boolean = true
): number | undefined {
  let text = rawText.trim()
  text = trimTextFromStartUntil(text, /\d/)
  text = trimTextFromEndUntil(text, /\d/)
  return cleanNumberText(text, isMoneyWithTwoDecimalPlaces)
}

// eslint-disable-next-line no-secrets/no-secrets
/**
 * Cleans a string representing a number, returning a number if possible.
 * @param {string} numberText - Text that represents a number.
 * @param {boolean} isMoneyWithTwoDecimalPlaces - Whether or not there should be two decimal places.
 * @returns {number | undefined} - A clean number, or undefined.
 */
export function cleanNumberText(
  numberText: string,
  isMoneyWithTwoDecimalPlaces: boolean
): number | undefined {
  const text = numberText.replaceAll(',', '').replaceAll(' ', '')

  const float = Number.parseFloat(text)

  if (Number.isNaN(float)) {
    console.log(`PARSING ERROR: ${text}`)
    return undefined
  } else if (isMoneyWithTwoDecimalPlaces) {
    return Number.parseFloat(text.replaceAll('.', '')) / 100
  }

  return float
}
