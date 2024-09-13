from langchain_community.document_loaders import PyPDFLoader
from helper import time_it

@time_it
def pdf_to_text(file_path, blocked_pages):
  print("Scanning document ...")
  loader = PyPDFLoader(file_path)
  docs = loader.load()

  doc = {i: {
    'content': docs[i].page_content
  } for i in range(len(docs)) if i + 1 not in blocked_pages}
  print("Scanning document completed...")
  return doc
