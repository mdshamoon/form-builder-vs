/**
 * Canvas component with Figma-like zoom and pan
 * Mobile-first with touch gestures
 */

import React, { useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAppStore } from '../stores/appStore';
import { FieldOverlay } from './FieldOverlay';
import type { Template } from '../types';

interface TemplateCanvasProps {
  template: Template;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({ template }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
  const { canvasState, setCanvasState, selectedFieldId, setSelectedFieldId } = useAppStore();

  // Load image dimensions
  useEffect(() => {
    if (template.image_url) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = template.image_url;
    } else if (template.image_width && template.image_height) {
      setImageDimensions({
        width: template.image_width,
        height: template.image_height,
      });
    }
  }, [template]);

  // Calculate actual displayed image dimensions with object-contain
  useEffect(() => {
    if (!canvasRef.current || !imageDimensions.width || !imageDimensions.height) return;

    const updateDisplayDimensions = () => {
      const containerWidth = canvasRef.current!.offsetWidth;
      const containerHeight = canvasRef.current!.offsetHeight;
      const imageAspectRatio = imageDimensions.width / imageDimensions.height;
      const containerAspectRatio = containerWidth / containerHeight;

      let displayWidth, displayHeight, offsetX = 0, offsetY = 0;

      if (containerAspectRatio > imageAspectRatio) {
        // Container is wider - image will be limited by height
        displayHeight = containerHeight;
        displayWidth = displayHeight * imageAspectRatio;
        offsetX = (containerWidth - displayWidth) / 2;
      } else {
        // Container is taller - image will be limited by width
        displayWidth = containerWidth;
        displayHeight = displayWidth / imageAspectRatio;
        offsetY = (containerHeight - displayHeight) / 2;
      }

      setDisplayDimensions({ width: displayWidth, height: displayHeight, offsetX, offsetY });
    };

    updateDisplayDimensions();
    window.addEventListener('resize', updateDisplayDimensions);
    return () => window.removeEventListener('resize', updateDisplayDimensions);
  }, [imageDimensions]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect field if clicking on empty canvas area
    if (e.target === e.currentTarget) {
      setSelectedFieldId(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      <TransformWrapper
        initialScale={canvasState.scale}
        initialPositionX={canvasState.positionX}
        initialPositionY={canvasState.positionY}
        minScale={0.1}
        maxScale={5}
        limitToBounds={false}
        centerOnInit
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        panning={{
          velocityDisabled: false,
        }}
        onTransformed={(ref) => {
          setCanvasState({
            scale: ref.state.scale,
            positionX: ref.state.positionX,
            positionY: ref.state.positionY,
          });
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={() => zoomIn()}
                className="btn-touch bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 active:scale-95 transition"
                aria-label="Zoom in"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => zoomOut()}
                className="btn-touch bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 active:scale-95 transition"
                aria-label="Zoom out"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => resetTransform()}
                className="btn-touch bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 active:scale-95 transition"
                aria-label="Reset zoom"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full flex items-center justify-center"
            >
              <div
                ref={canvasRef}
                className="relative"
                style={{
                  width: template.image_width || imageDimensions.width || 800,
                  height: template.image_height || imageDimensions.height || 1000,
                }}
                onClick={handleCanvasClick}
              >
                {/* Template image */}
                {template.image_url && (
                  <img
                    src={template.image_url}
                    alt={template.name}
                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                    draggable={false}
                  />
                )}

                {/* Field overlays */}
                {displayDimensions.width > 0 && template.fields.map((field) => {
                  const position = template.field_positions[field.id];
                  if (!position) return null;

                  return (
                    <FieldOverlay
                      key={field.id}
                      field={field}
                      position={position}
                      isSelected={selectedFieldId === field.id}
                      imageWidth={displayDimensions.width}
                      imageHeight={displayDimensions.height}
                      offsetX={displayDimensions.offsetX}
                      offsetY={displayDimensions.offsetY}
                      scale={canvasState.scale}
                      actualImageWidth={imageDimensions.width}
                      actualImageHeight={imageDimensions.height}
                    />
                  );
                })}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Canvas info overlay (bottom-left) */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-gray-600 shadow-lg">
        <div>Zoom: {Math.round(canvasState.scale * 100)}%</div>
        <div>Fields: {template.fields.length}</div>
      </div>
    </div>
  );
};
