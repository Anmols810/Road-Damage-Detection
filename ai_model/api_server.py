#!/usr/bin/env python3
"""
FastAPI server for pothole detection and analysis
Provides REST API endpoints for the frontend to interact with the AI model
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pothole_detector import PotholeDetector
import uvicorn
import logging
from typing import Dict, Any
import json
import os
from PIL import Image
import io
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RoadGuard AI API",
    description="AI-powered pothole detection and analysis API",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector
detector = None

@app.on_event("startup")
async def startup_event():
    """Initialize the AI model on startup"""
    global detector
    try:
        detector = PotholeDetector()
        if detector.model is None:
            # Create a new model if none exists
            detector.create_model()
            logger.warning("No pre-trained model found. Using untrained model with fallback analysis.")
        logger.info("AI model initialized successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize AI model: {e}")
        detector = None

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "RoadGuard AI API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": detector is not None and detector.model is not None
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_available": detector is not None and detector.model is not None,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.post("/analyze-pothole")
async def analyze_pothole(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Analyze a pothole image and return detailed analysis
    """
    if detector is None:
        raise HTTPException(
            status_code=503, 
            detail="AI detector not initialized. Please restart the server."
        )
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    try:
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Convert PIL image to numpy array
        image_array = np.array(image)
        
        # Analyze the image
        analysis = detector.analyze_pothole(image_array)
        
        if analysis is None:
            logger.error("Analysis returned None, this should not happen with fallback")
            raise HTTPException(
                status_code=500,
                detail="Failed to analyze image - unexpected error"
            )
        
        # Add metadata
        analysis['filename'] = file.filename
        analysis['file_size'] = len(image_data)
        analysis['image_dimensions'] = {
            'width': image.width,
            'height': image.height
        }
        
        logger.info(f"Successfully analyzed image: {file.filename}")
        return {
            "success": True,
            "analysis": analysis,
            "message": "Analysis completed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/analyze-pothole-batch")
async def analyze_pothole_batch(files: list[UploadFile] = File(...)) -> Dict[str, Any]:
    """
    Analyze multiple pothole images in batch
    """
    if detector is None or detector.model is None:
        raise HTTPException(
            status_code=503,
            detail="AI model not available"
        )
    
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 files allowed per batch"
        )
    
    results = []
    errors = []
    
    for file in files:
        try:
            if not file.content_type.startswith('image/'):
                errors.append({
                    "filename": file.filename,
                    "error": "Not an image file"
                })
                continue
            
            # Read and process image
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            image_array = np.array(image)
            
            # Analyze the image
            analysis = detector.analyze_pothole(image_array)
            
            if analysis is not None:
                analysis['filename'] = file.filename
                results.append(analysis)
            else:
                errors.append({
                    "filename": file.filename,
                    "error": "Analysis failed"
                })
                
        except Exception as e:
            errors.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {
        "success": len(results) > 0,
        "results": results,
        "errors": errors,
        "total_processed": len(results),
        "total_errors": len(errors)
    }

@app.get("/model-info")
async def get_model_info() -> Dict[str, Any]:
    """
    Get information about the loaded AI model
    """
    if detector is None or detector.model is None:
        return {
            "model_available": False,
            "message": "No model loaded"
        }
    
    model = detector.model
    
    return {
        "model_available": True,
        "model_path": detector.model_path,
        "input_size": detector.input_size,
        "total_parameters": model.count_params(),
        "model_layers": len(model.layers),
        "outputs": {
            "severity": "4 classes (low, medium, high, critical)",
            "confidence": "0-1 score",
            "dimensions": "width, length, depth in cm",
            "risk_level": "Low/Medium/High/Critical Risk",
            "priority": "1-10 scale"
        }
    }

@app.post("/train-model")
async def train_model_endpoint():
    """
    Endpoint to trigger model training (for development/testing)
    """
    try:
        from train_model import PotholeModelTrainer
        
        trainer = PotholeModelTrainer()
        history = trainer.train_model(epochs=10)  # Reduced epochs for API
        
        if history:
            return {
                "success": True,
                "message": "Model training completed",
                "epochs_trained": len(history.history['loss'])
            }
        else:
            return {
                "success": False,
                "message": "Model training failed"
            }
            
    except Exception as e:
        logger.error(f"Training error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Training failed: {str(e)}"
        )

@app.get("/sample-analysis")
async def get_sample_analysis() -> Dict[str, Any]:
    """
    Get a sample analysis result for testing/demonstration
    """
    sample_analysis = {
        "confidence": 0.87,
        "severity": "high",
        "severity_confidence": 0.89,
        "dimensions": {
            "width": 45.2,
            "length": 62.8,
            "depth": 8.5
        },
        "riskLevel": "High Risk",
        "risk_score": 0.75,
        "priority": 8,
        "area": 2839.8,
        "volume": 24138.3,
        "filename": "sample_pothole.jpg",
        "file_size": 245760,
        "image_dimensions": {
            "width": 800,
            "height": 600
        }
    }
    
    return {
        "success": True,
        "analysis": sample_analysis,
        "message": "Sample analysis result"
    }

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs("models", exist_ok=True)
    os.makedirs("uploads", exist_ok=True)
    
    # Run the server
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
