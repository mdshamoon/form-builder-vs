/**
 * Mobile-optimized field editor popup
 * Bottom sheet on mobile, modal on desktop
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAppStore } from '../stores/appStore';
import type { FormField } from '../types';

interface FieldEditorPopupProps {
  field: FormField | null;
}

export const FieldEditorPopup: React.FC<FieldEditorPopupProps> = ({ field }) => {
  const { isFieldEditorOpen, closeFieldEditor, formData, setFormValue, isMobile } = useAppStore();

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      value: field ? formData[field.id] || '' : '',
    },
  });

  // Update form when field changes
  useEffect(() => {
    if (field) {
      setValue('value', formData[field.id] || '');
    }
  }, [field, formData, setValue]);

  const onSubmit = (data: { value: string }) => {
    if (field) {
      setFormValue(field.id, data.value);
      closeFieldEditor();
    }
  };

  const handleClose = () => {
    closeFieldEditor();
  };

  if (!field) return null;

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <AnimatePresence>
        {isFieldEditorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Bottom sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Handle bar */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {field.placeholder && (
                    <p className="text-sm text-gray-500 mt-1">{field.placeholder}</p>
                  )}
                </div>

                {/* Field input */}
                <div>
                  {field.type === 'textarea' ? (
                    <textarea
                      {...register('value', { required: field.required })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                      rows={5}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      {...register('value', { required: field.required })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...register('value', { required: field.required })}
                      type={field.type}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 btn-touch bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 active:scale-95 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-touch bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-95 transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: center modal
  return (
    <AnimatePresence>
      {isFieldEditorOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {field.placeholder && (
                      <p className="text-sm text-gray-500 mt-1">{field.placeholder}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Field input */}
                <div>
                  {field.type === 'textarea' ? (
                    <textarea
                      {...register('value', { required: field.required })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                      rows={5}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      autoFocus
                    />
                  ) : field.type === 'select' ? (
                    <select
                      {...register('value', { required: field.required })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      autoFocus
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...register('value', { required: field.required })}
                      type={field.type}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      autoFocus
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 btn-touch bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-touch bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
