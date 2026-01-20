"""
Certificate PDF Generator - Creates Udemy-style certificates
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER
from io import BytesIO
from django.conf import settings
from datetime import datetime


def generate_certificate_pdf(certificate):
    """
    Generate a Udemy-style certificate PDF
    
    Args:
        certificate: Certificate model instance
        
    Returns:
        BytesIO: PDF file buffer
    """
    enrollment = certificate.enrollment
    user = enrollment.user
    course = enrollment.course
    
    # Create a BytesIO buffer to receive PDF data
    buffer = BytesIO()
    
    # Create the PDF object
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Colors - Website color scheme (PureLogics/TopSkill)
    primary_color = colors.HexColor('#10B981')  # Green accent (button.primary)
    accent_blue = colors.HexColor('#00235A')  # Dark blue (text.primary)
    text_color = colors.HexColor('#00235A')  # Dark blue text
    light_gray = colors.HexColor('#64748B')  # Muted gray (text.muted)
    background_light = colors.HexColor('#CAFCE5')  # Light blue-green background
    white = colors.HexColor('#FFFFFF')  # White
    
    # Background - Light gradient effect with website colors
    p.setFillColor(white)
    p.rect(0, 0, width, height, fill=1)
    
    # Subtle background accent
    p.setFillColor(background_light)
    p.rect(0, height - 1*inch, width, 1*inch, fill=1)
    p.rect(0, 0, width, 1*inch, fill=1)
    
    # Border decoration - Top and bottom borders
    border_color = colors.HexColor('#CBD5E1')  # border.primary
    p.setStrokeColor(border_color)
    p.setLineWidth(2)
    p.line(0.5*inch, 0.5*inch, width - 0.5*inch, 0.5*inch)  # Bottom border
    p.line(0.5*inch, height - 0.5*inch, width - 0.5*inch, height - 0.5*inch)  # Top border
    
    # Header - "Certificate of Completion"
    p.setFillColor(accent_blue)
    p.setFont("Helvetica-Bold", 36, leading=None)
    text = "Certificate of Completion"
    text_width = p.stringWidth(text, "Helvetica-Bold", 36)
    p.drawString((width - text_width) / 2, height - 2*inch, text)
    
    # Subtitle
    p.setFillColor(light_gray)
    p.setFont("Helvetica", 14)
    subtitle = "This is to certify that"
    subtitle_width = p.stringWidth(subtitle, "Helvetica", 14)
    p.drawString((width - subtitle_width) / 2, height - 2.5*inch, subtitle)
    
    # Student Name - Large and prominent
    full_name = user.get_full_name() or user.username
    p.setFillColor(text_color)
    p.setFont("Helvetica-Bold", 32)
    name_width = p.stringWidth(full_name, "Helvetica-Bold", 32)
    p.drawString((width - name_width) / 2, height - 3.5*inch, full_name)
    
    # Middle text
    p.setFillColor(light_gray)
    p.setFont("Helvetica", 14)
    middle_text = "has successfully completed the course"
    middle_width = p.stringWidth(middle_text, "Helvetica", 14)
    p.drawString((width - middle_width) / 2, height - 4.2*inch, middle_text)
    
    # Course Title - Prominent
    p.setFillColor(primary_color)  # Green accent
    p.setFont("Helvetica-Bold", 24)
    course_title = course.title
    # Handle long course titles by wrapping
    max_width = width - 2*inch
    if p.stringWidth(course_title, "Helvetica-Bold", 24) > max_width:
        # Split into multiple lines if too long
        words = course_title.split()
        lines = []
        current_line = []
        current_width = 0
        
        for word in words:
            word_width = p.stringWidth(word + " ", "Helvetica-Bold", 24)
            if current_width + word_width > max_width and current_line:
                lines.append(" ".join(current_line))
                current_line = [word]
                current_width = word_width
            else:
                current_line.append(word)
                current_width += word_width
        
        if current_line:
            lines.append(" ".join(current_line))
        
        y_position = height - 5*inch
        for line in lines:
            line_width = p.stringWidth(line, "Helvetica-Bold", 24)
            p.drawString((width - line_width) / 2, y_position, line)
            y_position -= 0.4*inch
    else:
        course_width = p.stringWidth(course_title, "Helvetica-Bold", 24)
        p.drawString((width - course_width) / 2, height - 5*inch, course_title)
    
    # Certificate Number
    p.setFillColor(light_gray)
    p.setFont("Helvetica", 10)
    cert_text = f"Certificate Number: {certificate.certificate_number}"
    cert_width = p.stringWidth(cert_text, "Helvetica", 10)
    p.drawString((width - cert_width) / 2, height - 6.5*inch, cert_text)
    
    # Issue Date - More prominent
    issue_date = certificate.issued_at.strftime("%B %d, %Y")
    p.setFillColor(text_color)
    p.setFont("Helvetica-Bold", 12)
    date_text = f"Issued on {issue_date}"
    date_width = p.stringWidth(date_text, "Helvetica-Bold", 12)
    p.drawString((width - date_width) / 2, height - 6.8*inch, date_text)
    
    # Signature line area (bottom section)
    signature_y = 1.5*inch
    
    # Left signature - Instructor/Organization
    p.setFillColor(text_color)
    p.setFont("Helvetica-Bold", 12)
    org_name = "TopSkill LMS"
    org_width = p.stringWidth(org_name, "Helvetica-Bold", 12)
    p.drawString(1.5*inch, signature_y, org_name)
    
    p.setFillColor(light_gray)
    p.setFont("Helvetica", 10)
    p.setStrokeColor(primary_color)
    p.setLineWidth(1.5)
    p.line(1.5*inch, signature_y - 0.1*inch, 1.5*inch + 2*inch, signature_y - 0.1*inch)
    p.drawString(1.5*inch, signature_y - 0.3*inch, "Organization")
    
    # Right signature - Date (more prominent)
    issue_date_formatted = certificate.issued_at.strftime("%B %d, %Y")
    p.setFillColor(text_color)
    p.setFont("Helvetica-Bold", 11)
    date_label = "Date"
    date_label_width = p.stringWidth(date_label, "Helvetica-Bold", 11)
    p.drawString(width - 1.5*inch - 2*inch, signature_y, date_label)
    
    p.setFillColor(accent_blue)
    p.setFont("Helvetica-Bold", 10)
    date_value_width = p.stringWidth(issue_date_formatted, "Helvetica-Bold", 10)
    p.drawString(width - 1.5*inch - 2*inch, signature_y - 0.25*inch, issue_date_formatted)
    
    p.setStrokeColor(primary_color)
    p.setLineWidth(1.5)
    p.line(width - 1.5*inch - 2*inch, signature_y - 0.4*inch, width - 1.5*inch, signature_y - 0.4*inch)
    
    # Footer - Verification info
    p.setFillColor(light_gray)
    p.setFont("Helvetica", 8)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    footer_text = f"Verify this certificate at: {frontend_url}/verify/{certificate.certificate_number}"
    footer_width = p.stringWidth(footer_text, "Helvetica", 8)
    p.drawString((width - footer_width) / 2, 0.3*inch, footer_text)
    
    # Decorative elements - Using website colors
    p.setFillColor(primary_color)  # Green accent
    p.setStrokeColor(primary_color)
    p.setLineWidth(2)
    
    # Top corners - Green circles
    p.circle(0.5*inch, height - 0.5*inch, 0.12*inch, fill=1)
    p.circle(width - 0.5*inch, height - 0.5*inch, 0.12*inch, fill=1)
    
    # Bottom corners - Green circles
    p.circle(0.5*inch, 0.5*inch, 0.12*inch, fill=1)
    p.circle(width - 0.5*inch, 0.5*inch, 0.12*inch, fill=1)
    
    # Additional decorative elements - Blue accents
    p.setFillColor(accent_blue)
    p.setStrokeColor(accent_blue)
    # Small squares at midpoints
    square_size = 0.08*inch
    p.rect(0.5*inch - square_size/2, height/2 - square_size/2, square_size, square_size, fill=1)
    p.rect(width - 0.5*inch - square_size/2, height/2 - square_size/2, square_size, square_size, fill=1)
    
    # Save the PDF
    p.showPage()
    p.save()
    
    # Get the value of the BytesIO buffer
    buffer.seek(0)
    return buffer

