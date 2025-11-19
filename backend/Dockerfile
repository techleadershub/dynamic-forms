FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE 8000

# Set default port if not provided
ENV PORT=8000

# Run the application (PORT is set by Railway)
CMD sh -c "uv run uvicorn app:app --host 0.0.0.0 --port ${PORT}"

