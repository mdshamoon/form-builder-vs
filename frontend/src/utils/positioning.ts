/**
 * Utilities for field positioning on canvas
 */

import type { FieldPosition } from '../types';

/**
 * Convert percentage position to pixel position
 */
export function percentToPixels(
  percent: FieldPosition,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: (percent.x / 100) * imageWidth,
    y: (percent.y / 100) * imageHeight,
    width: (percent.width / 100) * imageWidth,
    height: (percent.height / 100) * imageHeight,
  };
}

/**
 * Convert pixel position to percentage position
 */
export function pixelsToPercent(
  pixels: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number
): FieldPosition {
  return {
    x: (pixels.x / imageWidth) * 100,
    y: (pixels.y / imageHeight) * 100,
    width: (pixels.width / imageWidth) * 100,
    height: (pixels.height / imageHeight) * 100,
  };
}

/**
 * Apply canvas transform to position
 */
export function applyCanvasTransform(
  position: { x: number; y: number; width: number; height: number },
  scale: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: position.x * scale + offsetX,
    y: position.y * scale + offsetY,
    width: position.width * scale,
    height: position.height * scale,
  };
}

/**
 * Check if a point is inside a rectangle
 */
export function isPointInRect(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
