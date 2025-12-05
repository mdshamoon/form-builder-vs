/**
 * API client for backend communication
 */

import axios from 'axios';
import type { Template, Submission, User, AuthToken } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthToken> => {
    const response = await apiClient.post('/api/v1/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, full_name?: string): Promise<User> => {
    const response = await apiClient.post('/api/v1/auth/register', {
      email,
      password,
      full_name,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data;
  },
};

// Templates API
export const templatesApi = {
  list: async (params?: { skip?: number; limit?: number; is_public?: boolean }): Promise<Template[]> => {
    const response = await apiClient.get('/api/v1/templates', { params });
    return response.data;
  },

  get: async (id: string): Promise<Template> => {
    const response = await apiClient.get(`/api/v1/templates/${id}`);
    return response.data;
  },

  create: async (data: Partial<Template>): Promise<Template> => {
    const response = await apiClient.post('/api/v1/templates', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Template>): Promise<Template> => {
    const response = await apiClient.put(`/api/v1/templates/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/templates/${id}`);
  },
};

// Submissions API
export const submissionsApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    template_id?: string;
    email?: string;
    is_draft?: boolean;
  }): Promise<Submission[]> => {
    const response = await apiClient.get('/api/v1/submissions', { params });
    return response.data;
  },

  get: async (id: string): Promise<Submission> => {
    const response = await apiClient.get(`/api/v1/submissions/${id}`);
    return response.data;
  },

  create: async (data: {
    template_id: string;
    form_data: Record<string, string>;
    email?: string;
    is_draft?: boolean;
    resource_link_id?: string;
  }): Promise<Submission> => {
    const response = await apiClient.post('/api/v1/submissions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Submission>): Promise<Submission> => {
    const response = await apiClient.put(`/api/v1/submissions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/submissions/${id}`);
  },
};

// PDF API
export const pdfApi = {
  generatePdf: async (templateId: string, formData: Record<string, string>): Promise<Blob> => {
    const response = await apiClient.post(
      `/api/v1/pdf/generate/${templateId}`,
      formData,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  downloadPdf: async (templateId: string, formData: Record<string, string>, filename: string) => {
    const blob = await pdfApi.generatePdf(templateId, formData);

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
