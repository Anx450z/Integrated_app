from flask import Flask
from flask import request, jsonify
from pdf_to_text import pdf_to_text
from ocr_to_text import image_to_text
from gemini_json_parser import generate_from_pdf as generate_from_pdf_gemini, generate_report as generate_from_gemini
from openai_json_parser import generate_report as generate_from_openai, generate_pdf_report as generate_from_pdf_openai
from ollama_json_parser import generate_report as generate_from_ollama
from helper import is_text_empty, filter_escape_characters
from prompt import prompt, text_prompt
import json
from flask_cors import CORS
from flask_sse import sse

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
app.register_blueprint(sse, url_prefix='/stream')
app.config["REDIS_URL"] = "redis://redis:6379"

@app.route('/parse_json', methods=['GET'])
def pdf_to_json():
  file_path = request.args.get('doc_url')
  parse_method = request.args.get('parse_method')
  llm_model = request.args.get('llm_model')
  blocked_pages = request.args.get('blocked_pages')
  blocked_pages = [int(page) for page in blocked_pages.split(',')] if blocked_pages else []
  output= {}

  if parse_method == "pdf_to_json":
    if len(blocked_pages) > 0:
      sse.publish({"message":f"Uploading without {len(blocked_pages)} pages..."}, type="message")
    else:
      sse.publish({"message":"Uploading document..."}, type="message")
    response = generate_from_pdf(prompt(), file_path, llm_model, blocked_pages)
  elif parse_method == "text_to_json":
    response, text = text_to_json(file_path, llm_model, blocked_pages)
    output["raw_text"] = text
  elif parse_method == "image_to_json":
    response, text = image_to_json(file_path, llm_model, blocked_pages)
    output["raw_text"] = text
  else:
    raise Exception("Invalid parse_method")
  try:
    output["parsed_json"] = json.loads((response))
  except Exception as e:
    print(e)
  return jsonify(output)

def text_to_json(file_path, llm_model, blocked_pages):
  sse.publish({"message":"Scanning text..."}, type="message")
  text = pdf_to_text(file_path, blocked_pages)
  if is_text_empty(text):
    return image_to_json(file_path, llm_model, blocked_pages)
  sse.publish({"message":"Generating response..."}, type="message")
  return generate_report(text_prompt(text), llm_model), text

def image_to_json(file_path, llm_model, blocked_pages):
  sse.publish({"message":"Scanning image..."}, type="message")
  text = image_to_text(file_path, blocked_pages)
  if is_text_empty(text):
    raise Exception("No text found!")
  else:
    sse.publish({"message":"Generating response..."}, type="message")
    return generate_report(text_prompt(text), llm_model), text

def generate_report(prompt, llm_model):
  if llm_model == "gemini":
    return filter_escape_characters(generate_from_gemini(prompt))
  elif llm_model == "openai":
    return filter_escape_characters(generate_from_openai(prompt))
  elif llm_model == "ollama":
    return filter_escape_characters(generate_from_ollama(prompt))
  else:
    raise Exception("Invalid llm_model")

def generate_from_pdf(prompt, file_path, llm_model, blocked_pages):
  if llm_model == "gemini":
    return generate_from_pdf_gemini(prompt, file_path, blocked_pages)
  elif llm_model == "openai":
    return generate_from_pdf_openai(prompt, file_path, blocked_pages)
  else:
    raise Exception("Invalid prompt")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
