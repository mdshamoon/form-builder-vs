"""API endpoints for templates"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.db.base import get_db
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse

router = APIRouter()
logger = get_logger(__name__)


@router.get("/", response_model=List[TemplateResponse])
async def list_templates(
    skip: int = 0,
    limit: int = 100,
    is_public: bool = None,
    db: Session = Depends(get_db),
):
    """List all templates"""
    query = db.query(Template).filter(Template.is_active == True)

    if is_public is not None:
        query = query.filter(Template.is_public == is_public)

    templates = query.offset(skip).limit(limit).all()
    logger.info("templates_listed", count=len(templates))
    return templates


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: UUID, db: Session = Depends(get_db)):
    """Get a specific template"""
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        logger.warning("template_not_found", template_id=str(template_id))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )

    logger.info("template_retrieved", template_id=str(template_id))
    return template


@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(template_data: TemplateCreate, db: Session = Depends(get_db)):
    """Create a new template"""
    template = Template(
        name=template_data.name,
        description=template_data.description,
        template_type=template_data.template_type,
        is_public=template_data.is_public,
        fields=[ field.model_dump() for field in template_data.fields],
        field_positions={k: v.model_dump() for k, v in template_data.field_positions.items()},
        image_url=template_data.image_url,
        image_width=template_data.image_width,
        image_height=template_data.image_height,
    )

    db.add(template)
    db.commit()
    db.refresh(template)

    logger.info("template_created", template_id=str(template.id), name=template.name)
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: TemplateUpdate,
    db: Session = Depends(get_db),
):
    """Update a template"""
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )

    # Update fields
    update_data = template_data.model_dump(exclude_unset=True)

    # Handle fields and field_positions conversion
    if "fields" in update_data and update_data["fields"]:
        update_data["fields"] = [field.model_dump() if hasattr(field, "model_dump") else field for field in update_data["fields"]]

    if "field_positions" in update_data and update_data["field_positions"]:
        update_data["field_positions"] = {
            k: v.model_dump() if hasattr(v, "model_dump") else v
            for k, v in update_data["field_positions"].items()
        }

    for key, value in update_data.items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)

    logger.info("template_updated", template_id=str(template_id))
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: UUID, db: Session = Depends(get_db)):
    """Soft delete a template"""
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )

    template.is_active = False
    db.commit()

    logger.info("template_deleted", template_id=str(template_id))
    return None
