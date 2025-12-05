"""Pydantic schemas for templates"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# Field schemas
class FieldPosition(BaseModel):
    """Field position on template (percentage-based)"""

    x: float = Field(..., ge=0, le=100, description="X position (0-100%)")
    y: float = Field(..., ge=0, le=100, description="Y position (0-100%)")
    width: float = Field(..., ge=0, le=100, description="Width (0-100%)")
    height: float = Field(..., ge=0, le=100, description="Height (0-100%)")


class FormField(BaseModel):
    """Form field definition"""

    id: str
    label: str
    type: str = Field(..., description="text, textarea, number, date, select, etc.")
    value: Optional[str] = None
    required: bool = False
    options: Optional[list[str]] = None
    placeholder: Optional[str] = None


# Template schemas
class TemplateBase(BaseModel):
    """Base template schema"""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    template_type: str = Field(default="custom", description="cv, resume, swot, custom")
    is_public: bool = False


class TemplateCreate(TemplateBase):
    """Schema for creating a template"""

    fields: list[FormField] = []
    field_positions: dict[str, FieldPosition] = {}
    image_url: Optional[str] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None


class TemplateUpdate(BaseModel):
    """Schema for updating a template"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    template_type: Optional[str] = None
    is_public: Optional[bool] = None
    fields: Optional[list[FormField]] = None
    field_positions: Optional[dict[str, FieldPosition]] = None
    image_url: Optional[str] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None


class TemplateResponse(TemplateBase):
    """Schema for template response"""

    id: UUID
    fields: list[FormField]
    field_positions: dict[str, FieldPosition]
    image_url: Optional[str] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    thumbnail_url: Optional[str] = None
    is_active: bool
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Submission schemas
class SubmissionBase(BaseModel):
    """Base submission schema"""

    email: Optional[EmailStr] = None
    form_data: dict[str, str] = {}


class SubmissionCreate(SubmissionBase):
    """Schema for creating a submission"""

    template_id: UUID
    is_draft: bool = True
    resource_link_id: Optional[str] = None
    context_id: Optional[str] = None


class SubmissionUpdate(BaseModel):
    """Schema for updating a submission"""

    form_data: Optional[dict[str, str]] = None
    is_draft: Optional[bool] = None
    email: Optional[EmailStr] = None


class SubmissionResponse(SubmissionBase):
    """Schema for submission response"""

    id: UUID
    template_id: UUID
    is_draft: bool
    version_number: int
    resource_link_id: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# User schemas
class UserCreate(BaseModel):
    """Schema for creating a user"""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72, description="Password (8-72 characters)")
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response"""

    id: UUID
    email: str
    full_name: Optional[str] = None
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for authentication token"""

    access_token: str
    token_type: str = "bearer"
