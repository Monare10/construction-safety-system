from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfgen import canvas
from datetime import datetime
import io


def generate_certificate_pdf(
    worker_name: str,
    training_title: str,
    job_role: str,
    certificate_number: str,
    issued_at: datetime,
    expires_at: datetime,
    score: float
) -> bytes:
    """
    Generate a professional PDF safety certificate.
    Returns the PDF as bytes so it can be sent directly
    in the HTTP response.
    """

    buffer = io.BytesIO()

    # Use landscape A4 for certificate
    page_width, page_height = landscape(A4)

    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    # ── Background ─────────────────────────────────────
    c.setFillColor(colors.HexColor("#1A1A2E"))
    c.rect(0, 0, page_width, page_height, fill=True, stroke=False)

    # ── Orange border ──────────────────────────────────
    c.setStrokeColor(colors.HexColor("#E8660A"))
    c.setLineWidth(8)
    c.rect(15, 15, page_width - 30, page_height - 30, fill=False, stroke=True)

    # Inner border
    c.setLineWidth(2)
    c.setStrokeColor(colors.HexColor("#E8660A"))
    c.rect(25, 25, page_width - 50, page_height - 50, fill=False, stroke=True)

    # ── Header bar ─────────────────────────────────────
    c.setFillColor(colors.HexColor("#E8660A"))
    c.rect(25, page_height - 90, page_width - 50, 65, fill=True, stroke=False)

    # Company name in header
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(
        page_width / 2,
        page_height - 55,
        "CONSTRUCTION SITE SAFETY TRAINING & COMPLIANCE SYSTEM"
    )
    c.setFont("Helvetica", 10)
    c.drawCentredString(
        page_width / 2,
        page_height - 72,
        "Occupational Health & Safety Division"
    )

    # ── Certificate title ──────────────────────────────
    c.setFillColor(colors.HexColor("#E8660A"))
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(page_width / 2, page_height - 145, "CERTIFICATE OF COMPLETION")

    # Subtitle line
    c.setFillColor(colors.HexColor("#AAAAAA"))
    c.setFont("Helvetica", 12)
    c.drawCentredString(
        page_width / 2,
        page_height - 165,
        "This is to certify that"
    )

    # ── Worker name ────────────────────────────────────
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(page_width / 2, page_height - 205, worker_name.upper())

    # Underline the name
    name_width = c.stringWidth(worker_name.upper(), "Helvetica-Bold", 30)
    c.setStrokeColor(colors.HexColor("#E8660A"))
    c.setLineWidth(2)
    c.line(
        page_width / 2 - name_width / 2,
        page_height - 212,
        page_width / 2 + name_width / 2,
        page_height - 212
    )

    # ── Training details ───────────────────────────────
    c.setFillColor(colors.HexColor("#AAAAAA"))
    c.setFont("Helvetica", 12)
    c.drawCentredString(
        page_width / 2,
        page_height - 240,
        "has successfully completed the mandatory safety training program"
    )

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(page_width / 2, page_height - 268, f'"{training_title}"')

    c.setFillColor(colors.HexColor("#AAAAAA"))
    c.setFont("Helvetica", 12)
    c.drawCentredString(
        page_width / 2,
        page_height - 290,
        f"for the role of  {job_role}"
    )

    # ── Score badge ────────────────────────────────────
    c.setFillColor(colors.HexColor("#E8660A"))
    c.roundRect(page_width / 2 - 60, page_height - 340, 120, 35, 8, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(
        page_width / 2,
        page_height - 319,
        f"Assessment Score: {score:.1f}%"
    )

    # ── Date info ──────────────────────────────────────
    issued_str = issued_at.strftime("%d %B %Y")
    expires_str = expires_at.strftime("%d %B %Y")

    # Issued date box
    c.setFillColor(colors.HexColor("#16213E"))
    c.roundRect(80, 60, 180, 55, 6, fill=True, stroke=False)
    c.setFillColor(colors.HexColor("#E8660A"))
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(170, 103, "DATE ISSUED")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(170, 82, issued_str)

    # Expiry date box
    c.setFillColor(colors.HexColor("#16213E"))
    c.roundRect(page_width - 260, 60, 180, 55, 6, fill=True, stroke=False)
    c.setFillColor(colors.HexColor("#E8660A"))
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(page_width - 170, 103, "VALID UNTIL")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(page_width - 170, 82, expires_str)

    # ── Certificate number ─────────────────────────────
    c.setFillColor(colors.HexColor("#666666"))
    c.setFont("Helvetica", 8)
    c.drawCentredString(
        page_width / 2,
        42,
        f"Certificate No: {certificate_number}  |  "
        f"This certificate is valid for 12 months from date of issue"
    )

    c.save()
    buffer.seek(0)
    return buffer.getvalue()