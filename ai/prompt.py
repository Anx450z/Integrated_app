def prompt():
  output_format = f"""
  [{{user: <Name of the user to whom certificate is awarded if available. If not then provide null.>
  course_name: <Name of the course, it may also contain course code.>
  provider: <Provider institute or authority of the certificate, if not present then provide null.>
  credits: <CME or completed credits or acquired credits or hours completed by the user are present for each course. It is always a number. Do not use maximum credit>
  completion_date: <Completion date of the course. It is end date of the course. format it in DD/MM/YYYY>
  credit_category: <type of CME credit category without trademark. null if not available.>
  }}]
  """
  return  f"""
    You are a Json Parser, you are given a pdf file.
    Your task is to extract the data.

    ## Do not include the course if they does not have the following keys:
    - course_name
    - credits
    - completion_date

    Provide the output in valid JSON format. Remove escape characters if they are present in the text:
    Strictly follow the Output Format: {output_format}
  """

def text_prompt(text):
  output_format = f"""
  [{{
  user: <Name of the user to whom certificate is awarded if available. If not then provide null.>
  course_name: <Name of the course, it may also contain course code.>
  provider: <Provider institute or authority of the certificate, if not present then provide null.>
  credits: <CME or completed credits or acquired credits or hours completed by the user are present for each course. It is always a number. Do not use maximum credit>
  completion_date: <Completion date of the course. It is end date of the course. format it in DD/MM/YYYY>
  credit_category: <type of CME credit category without trademark. null if not available.>
  }}]
  """
  return  f"""
    You are a Json Parser, you are given a text extracted of medical course certificate delimited by ''' from a pdf using pyPDFLoader python library.
    Extracted text may have a tabular data in it. Your task is to extract the data.
    Data will a python dictionary in the format of <page_number>: {{'content' : <content>.}}
    Use <content> to extract the data. If there are multiple pages, use previous pages as context to help yourself.

    ## Do not include the course if they does not have the following keys:
    - course_name
    - credits
    - completion_date

    Text: '''{text}'''

    Provide the output in valid JSON format. Remove escape characters if they are present in the text:
    Strictly follow the Output Format: {output_format}
  """
