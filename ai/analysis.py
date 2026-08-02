import sys
import os
import re
import json
import pdfplumber
import calendar
from ocr import extract_text_from_pdf, extract_text_from_image
file_path = sys.argv[1]
mime_type = sys.argv[2]


extension = os.path.splitext(file_path)[1].lower()

text = ""

if mime_type == "application/pdf":

    # First try extracting text using pdfplumber
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    # If almost no text was extracted, use OCR
    if len(text.strip()) < 50:
        text = extract_text_from_pdf(file_path)

elif mime_type.startswith("image/"):

    # Direct OCR for image files
    text = extract_text_from_image(file_path)

else:
    print(json.dumps({"error": "Unsupported file type"}))
    sys.exit()


def first_match(patterns, source_text, flags=0):
    for pattern in patterns:
        m = re.search(pattern, source_text, flags)
        if m:
            return m
    return None


def clean_number(s):
    return s.replace(",", "").strip()


# Consumer Number
consumer_match = first_match(
    [
        r"(?:CA\s*NO\.?|Consumer\s*Number)\s*[:\-]?\s*([A-Za-z0-9Xx]+)",
        r"CA NO\.\s*:\s*([0-9xX]+)",
        r"Consumer Number\s*:\s*([0-9]+)",
    ],
    text,
    re.IGNORECASE,
)

consumer = (
    consumer_match.group(1).replace("O", "0").replace("o", "0")
    if consumer_match
    else ""
)

# Units
units_match = first_match(
    [
        r"Units?\s*[:\-]?\s*([\d,]+)",
        r"Units Consumed\s*:\s*([\d,]+)\s*kWh",
        r"(\d+)\s*kWh",
        r"KWH.*?\s(\d+)\s*$",
    ],
    text,
    re.IGNORECASE | re.MULTILINE,
)

units = int(clean_number(units_match.group(1))) if units_match else 0

# Bill Amount
amount_match = first_match(
    [
        r"(?:Net\s*Amount|Bill\s*Amount|Current\s*Demand)\s*[:\-]?\s*(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d+)?)",
        r"Total Bill Amount\s*[₹`]?\s*([\d,]+\.\d+)",
        r"`\s*([\d,]+\.\d+)",
    ],
    text,
    re.IGNORECASE,
)

bill = float(clean_number(amount_match.group(1))) if amount_match else 0

# Month
month_name = ""
month_match = re.search(
    r"Billing Month\s*:\s*([A-Za-z]+)\s+\d{4}",
    text,
    re.IGNORECASE,
)

if month_match:
    month_name = month_match.group(1)
else:
    bill_date = re.search(
        r"Bill\s*Date\s*[:\-]?\s*\d{2}/(\d{2})/\d{4}",
        text,
        re.IGNORECASE,
    )
    if bill_date:
        month_name = calendar.month_name[int(bill_date.group(1))]

data = {
    "consumerNumber": consumer,
    "units": units,
    "bill": bill,
    "month": month_name,
    "rawText": text,
}

print(json.dumps(data))
