import { trimTextFromEndUntil, trimTextFromStartUntil } from './trimmers.js'

/**
 * Extracts a number from a text string.
 * @param {string} rawText - Raw text string.
 * @returns {number} - Extracted number.
 */
export function trimToNumber(rawText: string): number | undefined {
  let text = rawText.trim()
  text = trimTextFromStartUntil(text, /\d/)
  text = trimTextFromEndUntil(text, /\d/)
  return cleanNumberText(text)
}

export function cleanNumberText(numberText: string): number | undefined {
  const text = numberText.replace(',', '')

  try {
    return Number.parseFloat(text)
  } catch {
    return undefined
  }
}
