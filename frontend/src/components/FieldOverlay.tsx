/**
 * Field overlay component - represents a field positioned on the canvas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { percentToPixels } from '../utils/positioning';
import { calculateFontSize } from '../utils/fontSizing';
import type { FormField, FieldPosition } from '../types';

interface FieldOverlayProps {
  field: FormField;
  position: FieldPosition;
  isSelected: boolean;
  imageWidth: number;
  imageHeight: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  actualImageWidth: number;
  actualImageHeight: number;
}

export const FieldOverlay: React.FC<FieldOverlayProps> = ({
  field,
  position,
  isSelected,
  imageWidth,
  imageHeight,
  offsetX,
  offsetY,
  scale,
  actualImageWidth,
  actualImageHeight,
}) => {
  const { openFieldEditor, formData } = useAppStore();

  // Convert percentage to pixels and apply offsets
  const pixelPosition = percentToPixels(position, imageWidth, imageHeight);
  const adjustedPosition = {
    x: pixelPosition.x + offsetX,
    y: pixelPosition.y + offsetY,
    width: pixelPosition.width,
    height: pixelPosition.height,
  };

  // Calculate font size based on ACTUAL image dimensions (for consistency with PDF)
  const actualPixelPosition = percentToPixels(position, actualImageWidth, actualImageHeight);
  const actualFontSize = calculateFontSize(actualPixelPosition.height);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFieldEditor(field.id);
  };

  const fieldValue = formData[field.id];
  const hasValue = fieldValue && fieldValue.trim().length > 0;

  return (
    <motion.div
      className={`
        absolute field-overlay cursor-pointer
        ${isSelected ? 'selected ring-2 ring-blue-500 ring-offset-2' : ''}
        ${hasValue ? 'border-green-500 bg-green-50' : ''}
      `}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        width: `${adjustedPosition.width}px`,
        height: `${adjustedPosition.height}px`,
      }}
      onClick={handleClick}
      layout
    >
      {/* Field label - keep at constant size */}
      <div
        className="absolute left-0 font-medium bg-blue-600 text-white rounded whitespace-nowrap"
        style={{
          fontSize: '12px',
          top: '-24px',
          padding: '4px 8px',
          borderRadius: '4px',
        }}
      >
        {field.label}
        {field.required && <span className="text-red-300 ml-1">*</span>}
      </div>

      {/* Field value preview - keep at constant size */}
      {hasValue && (
        <div
          className="absolute overflow-hidden font-medium text-gray-900"
          style={{
            fontSize: `${actualFontSize}px`,
            lineHeight: `${actualFontSize * 1.2}px`,
            padding: '2px',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {fieldValue}
        </div>
      )}

      {/* Empty field indicator - keep pencil icon at constant size */}
      {!hasValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="text-blue-400 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              width: '32px',
              height: '32px',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
};
