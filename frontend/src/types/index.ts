/**
 * TypeScript types for Format Forge Mobile
 */

export interface FieldPosition {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  width: number; // 0-100 percentage
  height: number; // 0-100 percentage
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio';
  value?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  template_type: 'cv' | 'resume' | 'swot' | 'custom';
  image_url?: string;
  image_width?: number;
  image_height?: number;
  thumbnail_url?: string;
  fields: FormField[];
  field_positions: Record<string, FieldPosition>;
  is_public: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  template_id: string;
  form_data: Record<string, string>;
  email?: string;
  user_id?: string;
  is_draft: boolean;
  version_number: number;
  resource_link_id?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface CanvasState {
  scale: number;
  positionX: number;
  positionY: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}
