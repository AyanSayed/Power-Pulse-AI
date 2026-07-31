import sys
import re
import json
import pdfplumber
import calendar
from ocr import extract_text_from_pdf

file_path = sys.argv[1]

text = ""

# First try extracting text using pdfplumber
with pdfplumber.open(file_path) as pdf:
    for page in pdf.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

# If almost no text was extracted, use OCR
if len(text.strip()) < 50:
    text = extract_text_from_pdf(file_path)

# Extract fields
# -----------------------------
# Flexible extraction for PDF + OCR
# -----------------------------

consumer = re.search(
    r"(?:CA\s*NO\.?|Consumer\s*Number)\s*[:\-]?\s*([A-Za-z0-9Xx]+)",
    text,
    re.IGNORECASE,
)

units = re.search(
    r"Units?\s*[:\-]?\s*(\d+)",
    text,
    re.IGNORECASE,
)

if not units:
    units = re.search(
        r"(\d+)\s*kWh",
        text,
        re.IGNORECASE,
    )

amount = re.search(
    r"(?:Net\s*Amount|Bill\s*Amount|Current\s*Demand)\s*[:\-]?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d+)?)",
    text,
    re.IGNORECASE,
)

month = re.search(
    r"Bill\s*Date\s*[:\-]?\s*\d{2}/(\d{2})/\d{4}",
    text,
    re.IGNORECASE,
)
month_num = int(month.group(1)) if month else None
month_name = calendar.month_name[month_num] if month_num else ""
data = {
    "consumerNumber": (
        consumer.group(1).replace("O", "0").replace("o", "0")
        if consumer
        else ""
    ),
    "units": int(units.group(1)) if units else 0,
    "bill": float(amount.group(1)) if amount else 0,
    "month": month_name,

    # NEW
    "rawText": text
}

print(json.dumps(data))