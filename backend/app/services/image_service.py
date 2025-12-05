"""Image upload and processing service"""

import os
import uuid
from pathlib import Path
from typing import Tuple
from PIL import Image
import io

from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class ImageService:
    """Service for handling image uploads and processing"""

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.templates_dir = self.upload_dir / "templates"
        self.thumbnails_dir = self.upload_dir / "thumbnails"

        # Create directories if they don't exist
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        self.thumbnails_dir.mkdir(parents=True, exist_ok=True)

    async def save_template_image(
        self, file_content: bytes, filename: str
    ) -> Tuple[str, int, int]:
        """
        Save uploaded template image and return URL and dimensions

        Args:
            file_content: Image file content
            filename: Original filename

        Returns:
            Tuple of (image_url, width, height)
        """
        try:
            # Generate unique filename
            ext = Path(filename).suffix.lower()
            if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
                raise ValueError(f"Unsupported image format: {ext}")

            unique_filename = f"{uuid.uuid4()}{ext}"
            file_path = self.templates_dir / unique_filename

            # Open and validate image
            image = Image.open(io.BytesIO(file_content))
            width, height = image.size

            # Convert RGBA to RGB if necessary
            if image.mode == "RGBA":
                background = Image.new("RGB", image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[3])
                image = background

            # Save image
            image.save(file_path, quality=95, optimize=True)

            # Generate thumbnail
            await self._create_thumbnail(image, unique_filename)

            image_url = f"/uploads/templates/{unique_filename}"
            logger.info("template_image_saved", filename=unique_filename, size=(width, height))

            return image_url, width, height

        except Exception as e:
            logger.error("image_save_failed", error=str(e))
            raise

    async def _create_thumbnail(self, image: Image.Image, filename: str) -> str:
        """Create thumbnail from image"""
        try:
            thumbnail = image.copy()
            thumbnail.thumbnail((300, 400), Image.Resampling.LANCZOS)

            thumbnail_path = self.thumbnails_dir / filename
            thumbnail.save(thumbnail_path, quality=85, optimize=True)

            thumbnail_url = f"/uploads/thumbnails/{filename}"
            logger.info("thumbnail_created", filename=filename)

            return thumbnail_url

        except Exception as e:
            logger.error("thumbnail_creation_failed", error=str(e))
            return ""

    async def delete_image(self, image_url: str) -> bool:
        """Delete image and its thumbnail"""
        try:
            # Extract filename from URL
            filename = Path(image_url).name

            # Delete main image
            image_path = self.templates_dir / filename
            if image_path.exists():
                image_path.unlink()

            # Delete thumbnail
            thumbnail_path = self.thumbnails_dir / filename
            if thumbnail_path.exists():
                thumbnail_path.unlink()

            logger.info("image_deleted", filename=filename)
            return True

        except Exception as e:
            logger.error("image_deletion_failed", error=str(e))
            return False

    def get_image_info(self, image_url: str) -> dict:
        """Get image information"""
        try:
            filename = Path(image_url).name
            image_path = self.templates_dir / filename

            if not image_path.exists():
                return {}

            image = Image.open(image_path)
            return {
                "width": image.width,
                "height": image.height,
                "format": image.format,
                "size": image_path.stat().st_size,
            }

        except Exception as e:
            logger.error("get_image_info_failed", error=str(e))
            return {}


# Singleton instance
image_service = ImageService()
