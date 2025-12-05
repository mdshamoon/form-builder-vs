/**
 * Utilities for consistent font sizing across preview and PDF
 */

/**
 * Calculate font size based on field height
 * This ensures consistent sizing in preview and PDF output
 */
export function calculateFontSize(fieldHeight: number): number {
  // Use a consistent formula: font size should be about 60% of field height
  // with min of 10px and max of 20px for readability
  return Math.max(10, Math.min(20, fieldHeight * 0.6));
}

/**
 * Calculate line height based on font size
 */
export function calculateLineHeight(fontSize: number): number {
  return fontSize * 1.2;
}

/**
 * Get text style object for consistent rendering
 */
export function getTextStyle(fieldHeight: number) {
  const fontSize = calculateFontSize(fieldHeight);
  const lineHeight = calculateLineHeight(fontSize);

  return {
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}px`,
  };
}
