/**
 * Template selector component
 * Shows list of available templates
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { templatesApi } from '../services/api';
import { useAppStore } from '../stores/appStore';
import type { Template } from '../types';

export const TemplateSelector: React.FC = () => {
  const { setSelectedTemplate, currentUser } = useAppStore();
  const navigate = useNavigate();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list({ is_public: true }),
  });

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load templates</h3>
        <p className="text-gray-600 text-center">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates available</h3>
        <p className="text-gray-600 text-center">Check back later or contact support</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Template</h2>
        <p className="text-gray-600">Select a template to start filling out your form</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <button
              onClick={() => handleSelectTemplate(template)}
              className="w-full text-left bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Template preview */}
              <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                {template.thumbnail_url || template.image_url ? (
                  <img
                    src={template.thumbnail_url || template.image_url}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Template type badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  {template.template_type.toUpperCase()}
                </div>

                {/* Edit button for admins */}
                {currentUser?.is_admin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/builder/${template.id}`);
                    }}
                    className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-blue-700"
                    title="Edit template"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Template info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{template.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{template.fields.length} fields</span>
                  <span>•</span>
                  <span>{template.is_public ? 'Public' : 'Private'}</span>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
