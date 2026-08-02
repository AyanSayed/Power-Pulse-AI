import pytesseract
from pdf2image import convert_from_path
from PIL import Image

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


def extract_text_from_image(image_path):
    image = Image.open(image_path)

    text = pytesseract.image_to_string(image)

    return text


# Only for testing
if __name__ == "__main__":

    file_path = input("Enter PDF/Image path: ")

    if file_path.lower().endswith(".pdf"):
        extracted = extract_text_from_pdf(file_path)
    else:
        extracted = extract_text_from_image(file_path)

    print("\n========== OCR TEXT ==========\n")
    print(extracted)