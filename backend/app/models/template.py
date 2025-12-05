"""Database models for templates"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, String, Text, JSON, Boolean, DateTime, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Template(Base):
    """Template model for storing form templates"""

    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Template image
    image_url = Column(Text, nullable=True)
    image_width = Column(Integer, nullable=True)
    image_height = Column(Integer, nullable=True)
    thumbnail_url = Column(Text, nullable=True)

    # Template type (cv, resume, swot, custom)
    template_type = Column(String(50), nullable=False, default="custom")

    # Field definitions (JSON array of field configurations)
    fields = Column(JSON, nullable=False, default=list)

    # Field positions (JSON object mapping field_id to position)
    field_positions = Column(JSON, nullable=False, default=dict)

    # Visibility
    is_public = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True, index=True)

    # Ownership
    created_by = Column(UUID(as_uuid=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    submissions = relationship("Submission", back_populates="template", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Template(id={self.id}, name={self.name})>"


class Submission(Base):
    """Submission model for storing form submissions"""

    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"), nullable=False, index=True)

    # Form data (JSON object with field values)
    form_data = Column(JSON, nullable=False, default=dict)

    # User information
    email = Column(String(255), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)

    # Draft management
    is_draft = Column(Boolean, default=True, index=True)
    version_number = Column(Integer, default=1)

    # OpenEdx integration
    resource_link_id = Column(String(255), nullable=True, index=True)
    context_id = Column(String(255), nullable=True)

    # PDF generation
    pdf_url = Column(Text, nullable=True)
    pdf_generated_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    submitted_at = Column(DateTime, nullable=True)

    # Relationships
    template = relationship("Template", back_populates="submissions")

    def __repr__(self):
        return f"<Submission(id={self.id}, template_id={self.template_id}, is_draft={self.is_draft})>"


class User(Base):
    """User model for authentication"""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Profile
    full_name = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
