#!/usr/bin/env python3
"""
Setup script for the RoadGuard AI system
Downloads dataset, trains model, and prepares the system for deployment
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_requirements():
    """Install required Python packages"""
    logger.info("Installing Python requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        logger.info("Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install requirements: {e}")
        return False
    return True

def download_dataset():
    """Download the RDD-2022 dataset"""
    logger.info("Downloading RDD-2022 dataset...")
    try:
        from download_dataset import download_rdd_dataset
        dataset_path = download_rdd_dataset()
        if dataset_path:
            logger.info(f"Dataset downloaded to: {dataset_path}")
            return True
        else:
            logger.error("Failed to download dataset")
            return False
    except Exception as e:
        logger.error(f"Error downloading dataset: {e}")
        return False

def train_model():
    """Train the pothole detection model"""
    logger.info("Training pothole detection model...")
    try:
        from train_model import main as train_main
        train_main()
        logger.info("Model training completed!")
        return True
    except Exception as e:
        logger.error(f"Error training model: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    directories = [
        "models",
        "dataset",
        "uploads",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        logger.info(f"Created directory: {directory}")

def setup_kaggle():
    """Setup Kaggle API (if credentials are available)"""
    logger.info("Setting up Kaggle API...")
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_dir.mkdir(exist_ok=True)
    
    # Check if kaggle.json exists
    kaggle_json = kaggle_dir / "kaggle.json"
    if kaggle_json.exists():
        logger.info("Kaggle credentials found!")
        return True
    else:
        logger.warning("Kaggle credentials not found. Please add your kaggle.json file to ~/.kaggle/")
        logger.info("You can get your credentials from: https://www.kaggle.com/account")
        return False

def main():
    """Main setup function"""
    logger.info("Starting RoadGuard AI setup...")
    
    # Create directories
    create_directories()
    
    # Install requirements
    if not install_requirements():
        logger.error("Setup failed at requirements installation")
        return False
    
    # Setup Kaggle
    kaggle_available = setup_kaggle()
    
    # Download dataset
    if kaggle_available:
        if not download_dataset():
            logger.warning("Dataset download failed, but continuing with synthetic data")
    else:
        logger.warning("Skipping dataset download due to missing Kaggle credentials")
    
    # Train model
    if not train_model():
        logger.error("Setup failed at model training")
        return False
    
    logger.info("RoadGuard AI setup completed successfully!")
    logger.info("You can now start the API server with: python api_server.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
