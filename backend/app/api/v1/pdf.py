"""API endpoints for PDF generation"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID
import io

from app.core.logging import get_logger
from app.db.base import get_db
from app.models.template import Template, Submission
from app.services.pdf_service import pdf_service

router = APIRouter()
logger = get_logger(__name__)


@router.post("/generate/{template_id}")
async def generate_pdf(
    template_id: UUID,
    form_data: dict[str, str],
    db: Session = Depends(get_db),
):
    """Generate PDF from template and form data"""
    # Get template
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )

    try:
        # Generate PDF
        pdf_content = await pdf_service.generate_pdf(
            template=template,
            form_data=form_data,
        )

        # Create filename
        filename = f"{template.name.replace(' ', '_')}.pdf"

        logger.info(
            "pdf_generated_via_api",
            template_id=str(template_id),
            size=len(pdf_content),
        )

        # Return PDF as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_content)),
            },
        )

    except Exception as e:
        logger.error("pdf_generation_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF",
        )


@router.get("/submission/{submission_id}")
async def get_submission_pdf(
    submission_id: UUID,
    db: Session = Depends(get_db),
):
    """Generate PDF from existing submission"""
    # Get submission
    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    # Get template
    template = db.query(Template).filter(Template.id == submission.template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )

    try:
        # Generate PDF
        pdf_content = await pdf_service.generate_pdf_from_submission(
            submission=submission,
            template=template,
        )

        # Create filename
        filename = f"{template.name.replace(' ', '_')}_{submission_id}.pdf"

        logger.info(
            "submission_pdf_generated",
            submission_id=str(submission_id),
            size=len(pdf_content),
        )

        # Return PDF
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_content)),
            },
        )

    except Exception as e:
        logger.error("submission_pdf_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF",
        )
