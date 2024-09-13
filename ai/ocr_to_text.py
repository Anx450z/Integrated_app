import pytesseract
from pdf2image import convert_from_path
from helper import time_it

@time_it
def image_to_text(file_path, blocked_pages, resolution=600):
  # convert to image using resolution dpi
  print("Scanning image...")
  pages = convert_from_path(file_path, resolution)
  doc ={}
  doc = {i: {
    'content': pytesseract.image_to_string(pages[i])
  } for i in range(len(pages)) if i + 1 not in blocked_pages}
  print("Scanning image completed...")
  return doc


def images_document(file_path, resolution=600):
  return convert_from_path(file_path, resolution)
