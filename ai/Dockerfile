# Use an official Python runtime as a parent image
FROM python:3.12-alpine

# Set the working directory in the container
WORKDIR /app

# Install poppler-utils using Alpine's package manager (apk)
RUN apk update && apk add --no-cache poppler-utils

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run Flask development server
CMD ["flask", "run", "--host=0.0.0.0"]
