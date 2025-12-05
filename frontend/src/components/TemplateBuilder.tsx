/**
 * Template Builder - Create and edit templates with drag-and-drop field positioning
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../services/api';
import { ImageUpload } from './ImageUpload';
import type { FormField, FieldPosition, Template } from '../types';

interface TemplateBuilderProps {
  onComplete?: () => void;
  template?: Template; // For editing existing template
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ onComplete, template }) => {
  const [step, setStep] = useState(1);
  const [imageData, setImageData] = useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldPositions, setFieldPositions] = useState<Record<string, FieldPosition>>({});
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDraggingField, setIsDraggingField] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      template_type: (template?.template_type || 'custom') as const,
      is_public: template?.is_public || false,
    },
  });

  // Load template data if editing
  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description,
        template_type: template.template_type as any,
        is_public: template.is_public,
      });
      setFields(template.fields);
      setFieldPositions(template.field_positions);
      if (template.image_url) {
        setImageData({
          url: template.image_url,
          width: template.image_width || 800,
          height: template.image_height || 1000,
        });
        setStep(3);
      }
    }
  }, [template, reset]);

  const createMutation = useMutation({
    mutationFn: templatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      if (onComplete) onComplete();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => templatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      if (onComplete) onComplete();
    },
  });

  // Add new field
  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
    };

    setFields([...fields, newField]);

    // Default position (center of canvas)
    setFieldPositions({
      ...fieldPositions,
      [newField.id]: {
        x: 25,
        y: 25,
        width: 50,
        height: 10,
      },
    });
  };

  // Remove field
  const removeField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
    const newPositions = { ...fieldPositions };
    delete newPositions[fieldId];
    setFieldPositions(newPositions);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  };

  // Handle field drag on canvas
  const handleFieldDrag = (fieldId: string, e: React.MouseEvent) => {
    if (!canvasRef.current || !imageData) return;

    setIsDraggingField(true);
    setSelectedFieldId(fieldId);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      const currentPosition = fieldPositions[fieldId];
      setFieldPositions({
        ...fieldPositions,
        [fieldId]: {
          ...currentPosition,
          x: Math.max(0, Math.min(100 - currentPosition.width, x)),
          y: Math.max(0, Math.min(100 - currentPosition.height, y)),
        },
      });
    };

    const handleMouseUp = () => {
      setIsDraggingField(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle field resize on canvas
  const handleFieldResize = (fieldId: string, e: React.MouseEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    if (!canvasRef.current || !imageData) return;

    e.preventDefault();
    setSelectedFieldId(fieldId);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const currentPosition = fieldPositions[fieldId];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const xPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      let newPosition = { ...currentPosition };

      if (corner === 'se') {
        // Bottom-right: adjust width and height
        newPosition.width = Math.max(5, Math.min(100 - currentPosition.x, xPercent - currentPosition.x));
        newPosition.height = Math.max(3, Math.min(100 - currentPosition.y, yPercent - currentPosition.y));
      } else if (corner === 'sw') {
        // Bottom-left: adjust x, width, and height
        const newX = Math.max(0, Math.min(currentPosition.x + currentPosition.width - 5, xPercent));
        newPosition.width = currentPosition.x + currentPosition.width - newX;
        newPosition.x = newX;
        newPosition.height = Math.max(3, Math.min(100 - currentPosition.y, yPercent - currentPosition.y));
      } else if (corner === 'ne') {
        // Top-right: adjust y, width, and height
        const newY = Math.max(0, Math.min(currentPosition.y + currentPosition.height - 3, yPercent));
        newPosition.height = currentPosition.y + currentPosition.height - newY;
        newPosition.y = newY;
        newPosition.width = Math.max(5, Math.min(100 - currentPosition.x, xPercent - currentPosition.x));
      } else if (corner === 'nw') {
        // Top-left: adjust x, y, width, and height
        const newX = Math.max(0, Math.min(currentPosition.x + currentPosition.width - 5, xPercent));
        const newY = Math.max(0, Math.min(currentPosition.y + currentPosition.height - 3, yPercent));
        newPosition.width = currentPosition.x + currentPosition.width - newX;
        newPosition.height = currentPosition.y + currentPosition.height - newY;
        newPosition.x = newX;
        newPosition.y = newY;
      }

      setFieldPositions({
        ...fieldPositions,
        [fieldId]: newPosition,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Save template
  const onSubmit = async (data: any) => {
    if (!imageData) {
      alert('Please upload a template image');
      return;
    }

    if (fields.length === 0) {
      alert('Please add at least one field');
      return;
    }

    try {
      const templateData = {
        ...data,
        image_url: imageData.url,
        image_width: imageData.width,
        image_height: imageData.height,
        fields,
        field_positions: fieldPositions,
      };

      if (template) {
        // Update existing template
        await updateMutation.mutateAsync({ id: template.id, data: templateData });
        alert('Template updated successfully!');
      } else {
        // Create new template
        await createMutation.mutateAsync(templateData);
        alert('Template created successfully!');
      }
    } catch (error) {
      alert(template ? 'Failed to update template' : 'Failed to create template');
      console.error(error);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onComplete}
            className="btn-touch flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {template ? 'Edit Template' : 'Template Builder'}
            </h1>
            <p className="text-gray-600 mt-1">
              {template ? 'Update template fields and positioning' : 'Create a new template with positioned fields'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Fields list */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Step 1: Basic Info */}
            {step >= 1 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">1. Template Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      {...register('name', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="CV Template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="A professional CV template..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      {...register('template_type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="custom">Custom</option>
                      <option value="cv">CV</option>
                      <option value="resume">Resume</option>
                      <option value="swot">SWOT</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('is_public')}
                      className="rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">Make public</label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Image Upload */}
            <div>
              <h3 className="font-semibold text-lg mb-4">2. Upload Image</h3>
              <ImageUpload
                onImageUploaded={(data) => {
                  setImageData({
                    url: `${import.meta.env.VITE_API_URL}${data.image_url}`,
                    width: data.width,
                    height: data.height,
                  });
                  if (step < 3) setStep(3);
                }}
                currentImage={imageData?.url}
              />
              {imageData && (
                <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Image uploaded successfully
                </div>
              )}
            </div>

            {/* Step 3: Add Fields */}
            {step >= 3 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">3. Add Fields</h3>

                <button
                  onClick={addField}
                  className="w-full btn-touch bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition mb-4"
                >
                  + Add Field
                </button>

                <Reorder.Group axis="y" values={fields} onReorder={setFields}>
                  {fields.map((field) => (
                    <Reorder.Item key={field.id} value={field} className="mb-2">
                      <div
                        className={`
                          p-3 bg-gray-50 rounded-lg border-2 cursor-move
                          ${selectedFieldId === field.id ? 'border-blue-500' : 'border-transparent'}
                        `}
                        onClick={() => setSelectedFieldId(field.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <input
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, { label: e.target.value })
                            }
                            className="font-medium bg-transparent border-none focus:outline-none flex-1"
                            placeholder="Field label"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeField(field.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(field.id, {
                              type: e.target.value as FormField['type'],
                            })
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1 mr-2"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="select">Select</option>
                        </select>

                        <label className="text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateField(field.id, { required: e.target.checked })
                            }
                            className="mr-1"
                          />
                          Required
                        </label>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-5xl mx-auto h-full">
              {imageData ? (
                <div
                  ref={canvasRef}
                  className="relative bg-white shadow-lg rounded-lg overflow-hidden"
                  style={{
                    aspectRatio: `${imageData.width} / ${imageData.height}`,
                  }}
                >
                  <img
                    src={imageData.url}
                    alt="Template"
                    className="w-full h-full object-contain select-none pointer-events-none"
                    draggable={false}
                  />

                  {/* Field overlays */}
                  {fields.map((field) => {
                    const position = fieldPositions[field.id];
                    if (!position) return null;

                    return (
                      <div
                        key={field.id}
                        className={`
                          absolute border-2 cursor-move group
                          ${selectedFieldId === field.id ? 'border-blue-500 bg-blue-100/30' : 'border-blue-400 bg-blue-50/20'}
                        `}
                        style={{
                          left: `${position.x}%`,
                          top: `${position.y}%`,
                          width: `${position.width}%`,
                          height: `${position.height}%`,
                        }}
                        onMouseDown={(e) => {
                          if (!(e.target as HTMLElement).classList.contains('resize-handle')) {
                            handleFieldDrag(field.id, e);
                          }
                        }}
                      >
                        <div className="absolute -top-6 left-0 text-xs font-medium bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap">
                          {field.label}
                        </div>

                        {/* Resize handles */}
                        {selectedFieldId === field.id && (
                          <>
                            {/* Bottom-right resize handle */}
                            <div
                              className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-se-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleFieldResize(field.id, e, 'se');
                              }}
                            />
                            {/* Bottom-left resize handle */}
                            <div
                              className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-sw-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleFieldResize(field.id, e, 'sw');
                              }}
                            />
                            {/* Top-right resize handle */}
                            <div
                              className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-ne-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleFieldResize(field.id, e, 'ne');
                              }}
                            />
                            {/* Top-left resize handle */}
                            <div
                              className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-nw-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleFieldResize(field.id, e, 'nw');
                              }}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg
                      className="w-24 h-24 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-lg">Upload an image to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {fields.length} field{fields.length !== 1 ? 's' : ''} added
            </div>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!imageData || fields.length === 0 || createMutation.isPending || updateMutation.isPending}
              className="btn-touch bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {(createMutation.isPending || updateMutation.isPending)
                ? template ? 'Updating...' : 'Creating...'
                : template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
