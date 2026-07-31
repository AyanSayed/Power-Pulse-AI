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


def first_match(patterns, source_text, flags=0):
    """Try each regex in order, return the first that matches."""
    for pattern in patterns:
        m = re.search(pattern, source_text, flags)
        if m:
            return m
    return None


def clean_number(s):
    return s.replace(",", "").strip()


# --- Consumer / CA number ---
# Tata Power style: "CA NO. : 6000xxxxxxx"
# Generic style:     "Consumer Number: 890123456789"
consumer_match = first_match(
    [
        r"CA NO\.\s*:\s*([0-9xX]+)",
        r"Consumer Number\s*:\s*([0-9]+)",
    ],
    text,
)
consumer = consumer_match.group(1) if consumer_match else ""

# --- Units consumed ---
# Generic style:     "Units Consumed: 395 kWh"
# Tata Power style:  a "KWH" label followed later by a number at line-end
units_match = first_match(
    [
        r"Units Consumed\s*:\s*([\d,]+)\s*kWh",
        r"KWH.*?\s(\d+)\s*$",
    ],
    text,
    re.MULTILINE | re.IGNORECASE,
)
units = int(clean_number(units_match.group(1))) if units_match else 0

# --- Bill / total amount ---
# Generic style:     "Total Bill Amount ₹3,260.00"
# Tata Power style:  amount prefixed with a backtick (PDF font renders ₹ as `)
amount_match = first_match(
    [
        r"Total Bill Amount\s*[₹`]?\s*([\d,]+\.\d+)",
        r"`\s*([\d,]+\.\d+)",
    ],
    text,
)
bill = float(clean_number(amount_match.group(1))) if amount_match else 0

# --- Billing month ---
# Generic style:     "Billing Month: June 2026" (month name given directly)
# Tata Power style:  "Bill Date : 18/07/2015" (need to convert month number -> name)
month_name = ""
month_name_match = re.search(r"Billing Month\s*:\s*([A-Za-z]+)\s+\d{4}", text)
if month_name_match:
    month_name = month_name_match.group(1)
else:
    month_num_match = re.search(r"Bill Date\s*:\s*\d{2}/(\d{2})/\d{4}", text)
    if month_num_match:
        month_num = int(month_num_match.group(1))
        month_name = calendar.month_name[month_num]

data = {
    "consumerNumber": consumer,
    "units": units,
    "bill": bill,
    "month": month_name,
}
print(json.dumps(data))