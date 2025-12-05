"""API endpoints for form submissions"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.db.base import get_db
from app.models.template import Submission
from app.schemas.template import SubmissionCreate, SubmissionUpdate, SubmissionResponse

router = APIRouter()
logger = get_logger(__name__)


@router.get("/", response_model=List[SubmissionResponse])
async def list_submissions(
    skip: int = 0,
    limit: int = 100,
    template_id: UUID = None,
    email: str = None,
    is_draft: bool = None,
    db: Session = Depends(get_db),
):
    """List submissions with optional filters"""
    query = db.query(Submission)

    if template_id:
        query = query.filter(Submission.template_id == template_id)
    if email:
        query = query.filter(Submission.email == email)
    if is_draft is not None:
        query = query.filter(Submission.is_draft == is_draft)

    submissions = query.offset(skip).limit(limit).all()
    logger.info("submissions_listed", count=len(submissions))
    return submissions


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: UUID, db: Session = Depends(get_db)):
    """Get a specific submission"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        logger.warning("submission_not_found", submission_id=str(submission_id))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    logger.info("submission_retrieved", submission_id=str(submission_id))
    return submission


@router.post("/", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission(submission_data: SubmissionCreate, db: Session = Depends(get_db)):
    """Create a new submission (draft or final)"""
    submission = Submission(
        template_id=submission_data.template_id,
        form_data=submission_data.form_data,
        email=submission_data.email,
        is_draft=submission_data.is_draft,
        resource_link_id=submission_data.resource_link_id,
        context_id=submission_data.context_id,
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    logger.info(
        "submission_created",
        submission_id=str(submission.id),
        template_id=str(submission.template_id),
        is_draft=submission.is_draft,
    )
    return submission


@router.put("/{submission_id}", response_model=SubmissionResponse)
async def update_submission(
    submission_id: UUID,
    submission_data: SubmissionUpdate,
    db: Session = Depends(get_db),
):
    """Update a submission"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    # Update fields
    update_data = submission_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(submission, key, value)

    db.commit()
    db.refresh(submission)

    logger.info("submission_updated", submission_id=str(submission_id))
    return submission


@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(submission_id: UUID, db: Session = Depends(get_db)):
    """Delete a submission"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    db.delete(submission)
    db.commit()

    logger.info("submission_deleted", submission_id=str(submission_id))
    return None
