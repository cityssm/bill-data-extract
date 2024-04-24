/**
 * Removes the first characters from a text string until the first character matches a regular expression.
 * @param {string} rawText - Raw text string
 * @param {RegExp} stopCharacterRegex - Regular expression for first character.
 * @returns {string} - Cleaned text string.
 */
export function trimTextFromStartUntil(
  rawText: string,
  stopCharacterRegex: RegExp
): string {
  let text = rawText

  while (text.length > 0 && !stopCharacterRegex.test(text.charAt(0))) {
    text = text.slice(1)
  }

  return text
}

/**
 * Removes the last characters from a text string until the last character matches a regular expression.
 * @param {string} rawText - Raw text string
 * @param {RegExp} stopCharacterRegex - Regular expression for last character.
 * @returns {string} - Cleaned text string.
 */
export function trimTextFromEndUntil(
  rawText: string,
  stopCharacterRegex: RegExp
): string {
  let text = rawText

  while (text.length > 0 && !stopCharacterRegex.test(text.at(-1) ?? '')) {
    text = text.slice(0, -1)
  }

  return text
}
