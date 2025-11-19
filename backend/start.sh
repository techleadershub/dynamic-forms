#!/bin/bash
# Railway startup script for backend

# Set default port if not provided
PORT=${PORT:-8000}

# Run uvicorn
uv run uvicorn backend.app:app --host 0.0.0.0 --port $PORT

