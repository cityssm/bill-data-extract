/**
 * Replaces common OCR-related typos in date strings.
 * @param {string} dateString - Dirty date string.
 * @returns {string} - Clean date string.
 */
export function replaceDateStringTypos(dateString: string): string {
  return dateString
    .replace('Anr', 'Apr')
    .replace('Aor', 'Apr')
    .replace('Mav', 'May')
    .replace('Jim', 'Jun')
}
