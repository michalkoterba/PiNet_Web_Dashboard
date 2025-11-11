# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# 1. Copy project definitions and source code
COPY pyproject.toml ./
COPY src/ /app/src/

# 2. Install the project and its dependencies from pyproject.toml
# This makes the 'pinet_web_dashboard' package available to the interpreter.
RUN pip install --no-cache-dir -e .

# 3. Copy the data directory
COPY data/ /app/data/

# Make port 80 available inside the container
# This does not publish the port to the host, but documents the intent.
EXPOSE 80

# Run the application using Gunicorn on internal port 8000
# This command is the entry point for the container.
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:80", "pinet_web_dashboard.main:app"]
