import requests
from helper import time_it, remove_markdown_formatting

url = "http://localhost:11434/api/generate"

def payload(prompt):
  return{
      "model": "phi3",
      "prompt": prompt,
      "stream": False,
      "format": "json",
      "raw": True,
      "options": {
        "temperature": 0
      },
  }

@time_it
def generate_report(prompt):
    response = requests.post(url, json=payload(prompt))
    return (response.json()['response'])

