#!/usr/bin/env python3
"""
Training script for the pothole detection model using RDD-2022 dataset
"""

import os
import numpy as np
import cv2
from pathlib import Path
import json
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt
from pothole_detector import PotholeDetector
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PotholeModelTrainer:
    def __init__(self, dataset_path: str = "dataset"):
        self.dataset_path = Path(dataset_path)
        self.detector = PotholeDetector()
        self.train_generator = None
        self.val_generator = None
        
    def create_synthetic_dataset(self, num_samples: int = 1000):
        """
        Create synthetic training data when real labeled data is not available
        This generates realistic pothole images with known parameters
        """
        logger.info(f"Creating synthetic dataset with {num_samples} samples...")
        
        synthetic_data = []
        labels = []
        
        for i in range(num_samples):
            # Generate random pothole characteristics
            width = np.random.uniform(10, 100)  # cm
            length = np.random.uniform(10, 120)  # cm
            depth = np.random.uniform(1, 20)  # cm
            
            # Determine severity based on dimensions
            area = width * length
            volume = area * depth
            
            if volume < 1000:
                severity = 0  # low
            elif volume < 3000:
                severity = 1  # medium
            elif volume < 6000:
                severity = 2  # high
            else:
                severity = 3  # critical
            
            # Generate risk level (0-1)
            risk_level = min(1.0, volume / 8000)
            
            # Generate priority (1-10)
            priority = min(10, max(1, int(volume / 800) + 1))
            
            # Generate confidence (0.7-0.95)
            confidence = np.random.uniform(0.7, 0.95)
            
            # Create synthetic image (placeholder)
            synthetic_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
            
            # Add some structure to make it look more realistic
            center_x, center_y = 112, 112
            cv2.circle(synthetic_image, (center_x, center_y), int(width/3), (50, 50, 50), -1)
            cv2.circle(synthetic_image, (center_x, center_y), int(width/4), (30, 30, 30), -1)
            
            synthetic_data.append(synthetic_image)
            
            # Create labels for multi-output model
            label = {
                'severity': severity,
                'confidence': confidence,
                'dimensions': [width/100, length/120, depth/20],  # normalized
                'risk_level': risk_level,
                'priority': priority/10  # normalized
            }
            labels.append(label)
        
        return np.array(synthetic_data), labels
    
    def prepare_training_data(self, use_synthetic: bool = True):
        """
        Prepare training data from dataset or create synthetic data
        """
        if use_synthetic:
            logger.info("Using synthetic training data...")
            X, y = self.create_synthetic_dataset(1000)
        else:
            # Load real dataset (implement based on actual dataset structure)
            X, y = self.load_real_dataset()
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        logger.info(f"Training samples: {len(X_train)}")
        logger.info(f"Validation samples: {len(X_val)}")
        
        return X_train, X_val, y_train, y_val
    
    def load_real_dataset(self):
        """
        Load real dataset from RDD-2022 (implement based on actual structure)
        """
        # This would be implemented based on the actual dataset structure
        # For now, return empty arrays
        logger.warning("Real dataset loading not implemented. Using synthetic data.")
        return np.array([]), []
    
    def create_data_generators(self, X_train, X_val, y_train, y_val):
        """
        Create data generators for training
        """
        # Data augmentation
        train_datagen = ImageDataGenerator(
            rotation_range=20,
            width_shift_range=0.1,
            height_shift_range=0.1,
            horizontal_flip=True,
            brightness_range=[0.8, 1.2],
            zoom_range=0.1,
            fill_mode='nearest'
        )
        
        val_datagen = ImageDataGenerator()
        
        # Convert labels to the format expected by the model
        def prepare_labels(labels):
            severity_labels = [label['severity'] for label in labels]
            confidence_labels = [[label['confidence']] for label in labels]
            dimensions_labels = [label['dimensions'] for label in labels]
            risk_labels = [[label['risk_level']] for label in labels]
            priority_labels = [[label['priority']] for label in labels]
            
            return {
                'severity_output': np.array(severity_labels),
                'confidence_output': np.array(confidence_labels),
                'dimensions_output': np.array(dimensions_labels),
                'risk_level_output': np.array(risk_labels),
                'priority_output': np.array(priority_labels)
            }
        
        y_train_dict = prepare_labels(y_train)
        y_val_dict = prepare_labels(y_val)
        
        # Create generators
        self.train_generator = train_datagen.flow(
            X_train, y_train_dict, batch_size=32
        )
        
        self.val_generator = val_datagen.flow(
            X_val, y_val_dict, batch_size=32
        )
        
        return self.train_generator, self.val_generator
    
    def train_model(self, epochs: int = 50):
        """
        Train the pothole detection model
        """
        logger.info("Preparing training data...")
        X_train, X_val, y_train, y_val = self.prepare_training_data()
        
        if len(X_train) == 0:
            logger.error("No training data available!")
            return None
        
        logger.info("Creating data generators...")
        train_gen, val_gen = self.create_data_generators(X_train, X_val, y_train, y_val)
        
        # Create model
        logger.info("Creating model...")
        model = self.detector.create_model()
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            keras.callbacks.ModelCheckpoint(
                'models/best_pothole_model.h5',
                monitor='val_loss',
                save_best_only=True
            )
        ]
        
        # Train model
        logger.info(f"Starting training for {epochs} epochs...")
        history = model.fit(
            train_gen,
            epochs=epochs,
            validation_data=val_gen,
            callbacks=callbacks,
            verbose=1
        )
        
        # Save final model
        self.detector.save_model()
        
        # Plot training history
        self.plot_training_history(history)
        
        logger.info("Training completed!")
        return history
    
    def plot_training_history(self, history):
        """
        Plot training history
        """
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        
        # Plot losses
        axes[0, 0].plot(history.history['loss'], label='Training Loss')
        axes[0, 0].plot(history.history['val_loss'], label='Validation Loss')
        axes[0, 0].set_title('Model Loss')
        axes[0, 0].legend()
        
        # Plot severity accuracy
        axes[0, 1].plot(history.history['severity_output_accuracy'], label='Training Accuracy')
        axes[0, 1].plot(history.history['val_severity_output_accuracy'], label='Validation Accuracy')
        axes[0, 1].set_title('Severity Classification Accuracy')
        axes[0, 1].legend()
        
        # Plot confidence MAE
        axes[0, 2].plot(history.history['confidence_output_mae'], label='Training MAE')
        axes[0, 2].plot(history.history['val_confidence_output_mae'], label='Validation MAE')
        axes[0, 2].set_title('Confidence Prediction MAE')
        axes[0, 2].legend()
        
        # Plot dimensions MAE
        axes[1, 0].plot(history.history['dimensions_output_mae'], label='Training MAE')
        axes[1, 0].plot(history.history['val_dimensions_output_mae'], label='Validation MAE')
        axes[1, 0].set_title('Dimensions Prediction MAE')
        axes[1, 0].legend()
        
        # Plot risk level MAE
        axes[1, 1].plot(history.history['risk_level_output_mae'], label='Training MAE')
        axes[1, 1].plot(history.history['val_risk_level_output_mae'], label='Validation MAE')
        axes[1, 1].set_title('Risk Level Prediction MAE')
        axes[1, 1].legend()
        
        # Plot priority MAE
        axes[1, 2].plot(history.history['priority_output_mae'], label='Training MAE')
        axes[1, 2].plot(history.history['val_priority_output_mae'], label='Validation MAE')
        axes[1, 2].set_title('Priority Prediction MAE')
        axes[1, 2].legend()
        
        plt.tight_layout()
        plt.savefig('training_history.png')
        plt.show()
        
        logger.info("Training history plot saved as 'training_history.png'")

def main():
    """Main training function"""
    # Create models directory
    os.makedirs("models", exist_ok=True)
    
    # Initialize trainer
    trainer = PotholeModelTrainer()
    
    # Train model
    history = trainer.train_model(epochs=30)
    
    if history:
        logger.info("Model training completed successfully!")
        
        # Test the trained model
        detector = PotholeDetector()
        if detector.model is not None:
            logger.info("Model loaded successfully. Ready for inference!")
        else:
            logger.error("Failed to load trained model!")
    else:
        logger.error("Model training failed!")

if __name__ == "__main__":
    import tensorflow as tf
    # Set memory growth for GPU
    physical_devices = tf.config.list_physical_devices('GPU')
    if len(physical_devices) > 0:
        tf.config.experimental.set_memory_growth(physical_devices[0], True)
    
    main()
