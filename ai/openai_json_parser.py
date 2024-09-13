from openai import OpenAI
from dotenv import load_dotenv
from helper import time_it
from ocr_to_text import images_document
import base64
import os
import requests
import json
from helper import remove_markdown_formatting
import io

load_dotenv()

llm = OpenAI()

@time_it
def generate_report(prompt):
    print("Generating response...")
    response = llm.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "system", "content": prompt}],
)
    return remove_markdown_formatting(response.choices[0].message.content)

@time_it
def generate_pdf_report(prompt, file_path, blocked_pages):
    print("Generating response...")

    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"
    }
    contents = build_content(prompt, file_path, blocked_pages)
    payload = {
    "model": "gpt-4o-mini",
    "messages":[{"role": "user", "content": contents}],
    "max_tokens": 8192
    }
    if len(contents) > 1:
      response =  requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
      return remove_markdown_formatting(response.json()['choices'][0]['message']['content'])
    else:
      return None


def build_content(prompt, file_path, blocked_pages):
    contents = []
    contents.append({
        "type": "text",
        "text": prompt,
    })
    for i, page in enumerate(images_document(file_path)):
        if i + 1 not in blocked_pages:
            buffered = io.BytesIO()
            page.save(buffered, format="JPEG")
            img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
            content = {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{img_str}"
                }
            }
            contents.append(content)
    return contents
