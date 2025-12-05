"""API endpoints for file uploads"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from pathlib import Path

from app.core.logging import get_logger
from app.services.image_service import image_service

router = APIRouter()
logger = get_logger(__name__)


@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile = File(...)):
    """Upload template image"""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )

    # Read file content
    content = await file.read()

    # Check file size (max 10MB)
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 10MB",
        )

    try:
        # Save image
        image_url, width, height = await image_service.save_template_image(
            content, file.filename
        )

        # Generate thumbnail URL
        filename = Path(image_url).name
        thumbnail_url = f"/uploads/thumbnails/{filename}"

        logger.info("image_uploaded", filename=file.filename, size=len(content))

        return {
            "image_url": image_url,
            "thumbnail_url": thumbnail_url,
            "width": width,
            "height": height,
            "filename": file.filename,
            "size": len(content),
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error("image_upload_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image",
        )


@router.get("/templates/{filename}")
async def get_template_image(filename: str):
    """Serve template image"""
    file_path = Path("uploads/templates") / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    return FileResponse(file_path)


@router.get("/thumbnails/{filename}")
async def get_thumbnail_image(filename: str):
    """Serve thumbnail image"""
    file_path = Path("uploads/thumbnails") / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thumbnail not found",
        )

    return FileResponse(file_path)


@router.delete("/image")
async def delete_image(image_url: str):
    """Delete uploaded image"""
    try:
        success = await image_service.delete_image(image_url)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found",
            )

        logger.info("image_deleted", image_url=image_url)

        return {"message": "Image deleted successfully"}

    except Exception as e:
        logger.error("image_deletion_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete image",
        )
