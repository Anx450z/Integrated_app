import os
import google.generativeai as genai
from dotenv import load_dotenv
from helper import time_it

load_dotenv()

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

llm = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config={
        "temperature": 0.9,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    },
)


@time_it
def generate_report(prompt):
    print("Generating response...")
    response = llm.generate_content(prompt)
    return response.text

@time_it
def generate_from_pdf(prompt, pdf_file):
    print("Uploading file...")
    genai.upload_file(pdf_file)
    print("Generating response...")
    response = llm.generate_content([prompt, pdf_file])
    return response.text
