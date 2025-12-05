"""PDF generation service"""

import io
from pathlib import Path
from typing import Dict, List
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from PIL import Image

from app.core.logging import get_logger
from app.models.template import Template, Submission

logger = get_logger(__name__)


class PDFService:
    """Service for generating PDFs from templates and submissions"""

    def __init__(self):
        self.page_sizes = {
            "letter": letter,
            "a4": A4,
        }

    def calculate_font_size(self, field_height: float) -> float:
        """Calculate font size based on field height (matches frontend logic)"""
        return max(10, min(20, field_height * 0.6))

    async def generate_pdf(
        self,
        template: Template,
        form_data: Dict[str, str],
        page_size: str = "a4",
    ) -> bytes:
        """
        Generate PDF from template and form data

        Args:
            template: Template object with fields and positions
            form_data: Dictionary of field values
            page_size: Page size (letter or a4)

        Returns:
            PDF file content as bytes
        """
        try:
            # Create PDF buffer
            buffer = io.BytesIO()

            # Determine page size from template image dimensions
            page_width = template.image_width or 595  # Default to A4 width if not available
            page_height = template.image_height or 842  # Default to A4 height if not available

            # Try to get actual image dimensions if available
            image_path = None
            if template.image_url:
                # Convert URL path to file path
                relative_path = template.image_url.lstrip("/")
                test_path = Path(relative_path)

                if test_path.exists():
                    image_path = test_path
                else:
                    # Try just the filename in uploads/templates
                    filename = Path(template.image_url).name
                    test_path = Path("uploads/templates") / filename
                    if test_path.exists():
                        image_path = test_path

                # Get actual image dimensions from file
                if image_path and image_path.exists():
                    try:
                        img = Image.open(image_path)
                        page_width, page_height = img.size
                        logger.info("using_image_dimensions", width=page_width, height=page_height)
                    except Exception as e:
                        logger.warning("failed_to_read_image_dimensions", error=str(e))

            # Create canvas with template dimensions
            c = canvas.Canvas(buffer, pagesize=(page_width, page_height))

            # Draw template image if available
            if image_path and image_path.exists():
                try:
                    # Draw image at full size (0,0 to page_width, page_height)
                    c.drawImage(
                        str(image_path),
                        0,
                        0,
                        width=page_width,
                        height=page_height,
                        preserveAspectRatio=False,  # Image fills entire page
                    )
                    logger.info("template_image_added_to_pdf", image_path=str(image_path))
                except Exception as e:
                    logger.warning("failed_to_draw_template_image", error=str(e), image_url=template.image_url)

            # Draw form fields
            for field in template.fields:
                # Handle both dict and object formats
                field_id = field.get("id") if isinstance(field, dict) else field.id
                field_type = field.get("type") if isinstance(field, dict) else field.type
                value = form_data.get(field_id, "")

                if not value:
                    continue

                # Get field position (percentage-based)
                position = template.field_positions.get(field_id)
                if not position:
                    continue

                # Convert percentage to points
                x = (position["x"] / 100) * page_width
                y = page_height - ((position["y"] / 100) * page_height)  # Flip Y axis
                width = (position["width"] / 100) * page_width
                height = (position["height"] / 100) * page_height

                # Calculate font size based on field height (consistent with frontend)
                font_size = self.calculate_font_size(height)
                line_height = font_size * 1.2

                # Set font with calculated size
                c.setFont("Helvetica", font_size)

                # Draw field value
                try:
                    # Handle multiline text
                    if field_type == "textarea" and "\n" in value:
                        lines = value.split("\n")
                        for i, line in enumerate(lines):
                            text_y = y - 5 - (i * line_height)
                            if text_y > y - height:  # Only draw if within field bounds
                                c.drawString(x + 5, text_y, line[:100])
                    else:
                        # Single line - center vertically
                        text_y = y - (height / 2) - (font_size / 2)
                        # Truncate if too long
                        max_chars = int(width / (font_size * 0.5))
                        truncated = value[:max_chars]
                        c.drawString(x + 5, text_y, truncated)
                except Exception as e:
                    logger.warning("failed_to_draw_field", field_id=field_id, error=str(e))

            # Add metadata
            c.setTitle(f"{template.name} - Form Submission")
            c.setAuthor("Format Forge Mobile")
            c.setSubject(template.description or template.name)

            # Finalize PDF
            c.showPage()
            c.save()

            # Get PDF content
            pdf_content = buffer.getvalue()
            buffer.close()

            logger.info(
                "pdf_generated",
                template_id=str(template.id),
                fields_count=len(form_data),
                size=len(pdf_content),
            )

            return pdf_content

        except Exception as e:
            logger.error("pdf_generation_failed", error=str(e))
            raise

    async def generate_pdf_from_submission(
        self, submission: Submission, template: Template
    ) -> bytes:
        """Generate PDF from submission object"""
        return await self.generate_pdf(
            template=template,
            form_data=submission.form_data,
        )


# Singleton instance
pdf_service = PDFService()
