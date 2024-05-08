/**
 * Converts a percentage and pixel length into a pixel position.
 * @param {number} percentage - Between 0 and 100.
 * @param {number} length - Pixel length.
 * @returns {number} - Pixel position.
 */
export function percentageToCoordinate(
  percentage: number,
  length: number
): number {
  return Math.round((percentage / 100) * length)
}
