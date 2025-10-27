FROM python:3.12.11-slim


# Set working directory
WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl gnupg apt-transport-https unixodbc-dev && \
    mkdir -p /etc/apt/keyrings && \
    curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /etc/apt/keyrings/microsoft.gpg && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql18 && \
    apt-get install -y \
    build-essential \
    libffi-dev \
    git && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements.txt first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install additional dependencies
RUN pip install setuptools

# Copy the application code
COPY . .

# Create necessary directories
RUN mkdir -p web_app/storage/favourites web_app/storage/threads web_app/temp web_app/logs

# Expose the port
EXPOSE 5000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Set the working directory to web_app
WORKDIR /app/web_app
