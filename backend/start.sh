#!/bin/bash
# Start the backend server
python -m uvicorn main:app --host 0.0.0.0 --port 8000
