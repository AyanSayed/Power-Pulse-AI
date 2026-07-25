import sys
import re
import json
import pdfplumber
import calendar

file_path = sys.argv[1]

text = ""

with pdfplumber.open(file_path) as pdf:
    for page in pdf.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

# Extract fields
consumer = re.search(r"CA NO\.\s*:\s*([0-9xX]+)", text)
units = re.search(r"KWH.*?\s(\d+)\s*$", text, re.MULTILINE)
amount = re.search(r"`\s*(\d+\.\d+)", text)
month = re.search(r"Bill Date\s*:\s*\d{2}/(\d{2})/\d{4}", text)
month_num = int(month.group(1)) if month else None
month_name = calendar.month_name[month_num] if month_num else ""
data = {
    "consumerNumber": consumer.group(1) if consumer else "",
    "units": int(units.group(1)) if units else 0,
    "bill": float(amount.group(1)) if amount else 0,
    "month": month_name,
}
print(json.dumps(data))