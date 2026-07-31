import pytesseract
from pdf2image import convert_from_path

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Poppler path
POPPLER_PATH = r"C:\Users\Purva Khandekar\Downloads\Release-26.02.0-0\poppler-26.02.0\Library\bin"


def extract_text_from_pdf(pdf_path):
    pages = convert_from_path(
        pdf_path,
        poppler_path=POPPLER_PATH
    )

    text = ""

    for page in pages:
        text += pytesseract.image_to_string(page) + "\n"

    return text


# Only for testing
if __name__ == "__main__":
    pdf = input("Enter PDF path: ")

    extracted = extract_text_from_pdf(pdf)

    print("\n========== OCR TEXT ==========\n")
    print(extracted)