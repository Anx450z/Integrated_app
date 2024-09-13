import re
import time
def is_text_empty(d):
    return all(not filter_text(v.get('content')) for v in d.values())

def text_length(d):
    # remove all the escape characters like \n, \t and spaces
    return sum(len(filter_text(v.get('content'))) for v in d.values())

def remove_markdown_formatting(text):
    pattern = r"```json(.*?)```"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return filter_escape_characters(match.group(1))
    return None

def time_it(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        # print in two decimal places in seconds
        print(f"{func.__name__} took {round(end - start, 2)} seconds")
        return result
    return wrapper

def filter_text(text):
    return re.sub(r'\s+|\\[nts]', '', text)

def filter_escape_characters(text):
    return re.sub(r'\\[nt]', '', text)
