@echo off
echo Starting RoadGuard AI System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Navigate to AI model directory
cd ai_model

REM Check if requirements are installed
echo Checking Python dependencies...
python -c "import tensorflow, fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if model exists, if not train one
if not exist "models\pothole_detector.h5" (
    echo No trained model found. Training a new model...
    python train_model.py
    if errorlevel 1 (
        echo Warning: Model training failed, but continuing with mock model
    )
)

REM Start the API server
echo Starting AI API server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python api_server.py

pause
