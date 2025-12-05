/**
 * Zustand store for application state
 */

import { create } from 'zustand';
import type { Template, FormField, CanvasState, User } from '../types';

interface AppState {
  // Auth state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;

  // Template state
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;

  // Preview mode
  isPreviewMode: boolean;
  setPreviewMode: (mode: boolean) => void;

  // Canvas state
  canvasState: CanvasState;
  setCanvasState: (state: Partial<CanvasState>) => void;
  resetCanvasState: () => void;

  // Selected field
  selectedFieldId: string | null;
  setSelectedFieldId: (fieldId: string | null) => void;

  // Form data
  formData: Record<string, string>;
  setFormValue: (fieldId: string, value: string) => void;
  setFormData: (data: Record<string, string>) => void;
  clearFormData: () => void;

  // Field editor popup
  isFieldEditorOpen: boolean;
  openFieldEditor: (fieldId: string) => void;
  closeFieldEditor: () => void;

  // UI state
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  // Sidebar/drawer state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const DEFAULT_CANVAS_STATE: CanvasState = {
  scale: 1,
  positionX: 0,
  positionY: 0,
};

export const useAppStore = create<AppState>((set) => ({
  // Auth
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ currentUser: null, selectedTemplate: null, formData: {} });
  },

  // Template
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  // Preview mode
  isPreviewMode: false,
  setPreviewMode: (mode) => set({ isPreviewMode: mode }),

  // Canvas
  canvasState: DEFAULT_CANVAS_STATE,
  setCanvasState: (newState) =>
    set((state) => ({
      canvasState: { ...state.canvasState, ...newState },
    })),
  resetCanvasState: () => set({ canvasState: DEFAULT_CANVAS_STATE }),

  // Selected field
  selectedFieldId: null,
  setSelectedFieldId: (fieldId) => set({ selectedFieldId: fieldId }),

  // Form data
  formData: {},
  setFormValue: (fieldId, value) =>
    set((state) => ({
      formData: { ...state.formData, [fieldId]: value },
    })),
  setFormData: (data) => set({ formData: data }),
  clearFormData: () => set({ formData: {} }),

  // Field editor popup
  isFieldEditorOpen: false,
  openFieldEditor: (fieldId) =>
    set({ isFieldEditorOpen: true, selectedFieldId: fieldId }),
  closeFieldEditor: () =>
    set({ isFieldEditorOpen: false, selectedFieldId: null }),

  // UI
  isMobile: window.innerWidth < 768,
  setIsMobile: (mobile) => set({ isMobile: mobile }),

  // Sidebar
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
