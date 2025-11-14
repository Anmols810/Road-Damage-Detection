#!/bin/bash

echo "Starting RoadGuard AI System..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Navigate to AI model directory
cd ai_model

# Check if requirements are installed
echo "Checking Python dependencies..."
if ! python3 -c "import tensorflow, fastapi, uvicorn" &> /dev/null; then
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

# Check if model exists, if not train one
if [ ! -f "models/pothole_detector.h5" ]; then
    echo "No trained model found. Training a new model..."
    python3 train_model.py
    if [ $? -ne 0 ]; then
        echo "Warning: Model training failed, but continuing with mock model"
    fi
fi

# Start the API server
echo "Starting AI API server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo
python3 api_server.py
