#!/usr/bin/env python3
"""
Script to download and prepare the RDD-2022 dataset for pothole detection
"""

import kagglehub
import os
import shutil
from pathlib import Path

def download_rdd_dataset():
    """Download the RDD-2022 dataset from Kaggle"""
    print("Downloading RDD-2022 dataset...")
    
    try:
        # Download the dataset
        path = kagglehub.dataset_download("aliabdelmenam/rdd-2022")
        print(f"Dataset downloaded to: {path}")
        
        # Create organized directory structure
        dataset_dir = Path("dataset")
        dataset_dir.mkdir(exist_ok=True)
        
        # Copy relevant files to our organized structure
        source_path = Path(path)
        
        # Find pothole-related directories
        for item in source_path.rglob("*"):
            if item.is_dir() and "pothole" in item.name.lower():
                dest_dir = dataset_dir / "potholes"
                dest_dir.mkdir(exist_ok=True)
                
                # Copy images
                for img_file in item.glob("*.jpg"):
                    shutil.copy2(img_file, dest_dir)
                for img_file in item.glob("*.png"):
                    shutil.copy2(img_file, dest_dir)
                
                print(f"Copied pothole images from {item.name}")
        
        print("Dataset preparation completed!")
        return dataset_dir
        
    except Exception as e:
        print(f"Error downloading dataset: {e}")
        return None

if __name__ == "__main__":
    download_rdd_dataset()
