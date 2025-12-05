/**
 * Top toolbar with actions and info
 */

import React from 'react';
import { useAppStore } from '../stores/appStore';
import type { Template } from '../types';

interface ToolbarProps {
  template: Template | null;
  onBack: () => void;
  onSave: () => void;
  onSubmit: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ template, onBack, onSave, onSubmit }) => {
  const { formData, toggleSidebar } = useAppStore();

  const filledFields = template
    ? Object.keys(formData).filter((key) => formData[key] && formData[key].trim().length > 0).length
    : 0;
  const totalFields = template?.fields.length || 0;
  const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Back button */}
        <button
          onClick={onBack}
          className="btn-touch flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline font-medium">Back</span>
        </button>

        {/* Center: Template name and progress */}
        <div className="flex-1 mx-4 text-center">
          <h1 className="font-semibold text-gray-900 truncate">{template?.name || 'Format Forge'}</h1>
          {template && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {filledFields}/{totalFields}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {template && (
            <>
              <button
                onClick={onSave}
                className="hidden sm:flex btn-touch items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save Draft
              </button>

              <button
                onClick={onSubmit}
                disabled={progress < 100}
                className="btn-touch flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="hidden sm:inline">Submit</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="sm:hidden btn-touch p-2 text-gray-700 hover:text-gray-900 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
