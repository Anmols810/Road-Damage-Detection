#!/usr/bin/env python3
"""
Test script to verify the AI model fixes
"""

import requests
import io
from PIL import Image
import numpy as np

def create_test_image():
    """Create a simple test image"""
    # Create a simple test image with some pattern
    img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    
    # Add a simple "pothole" pattern
    center_x, center_y = 112, 112
    cv2.circle(img, (center_x, center_y), 30, (50, 50, 50), -1)
    cv2.circle(img, (center_x, center_y), 20, (30, 30, 30), -1)
    
    return img

def test_api():
    """Test the API with a simple image"""
    try:
        # Create test image
        test_img = create_test_image()
        
        # Convert to PIL Image
        pil_img = Image.fromarray(test_img)
        
        # Save to bytes
        img_bytes = io.BytesIO()
        pil_img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        # Test the API
        response = requests.post(
            'http://localhost:8000/analyze-pothole',
            files={'file': ('test.jpg', img_bytes, 'image/jpeg')}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API Test Successful!")
            print(f"Confidence: {result['analysis']['confidence']}")
            print(f"Severity: {result['analysis']['severity']}")
            print(f"Risk Level: {result['analysis']['riskLevel']}")
            print(f"Dimensions: {result['analysis']['dimensions']}")
            return True
        else:
            print(f"❌ API Test Failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test Error: {e}")
        return False

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health Check: {result['status']}")
            print(f"Model Available: {result['model_available']}")
            return True
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health Check Error: {e}")
        return False

if __name__ == "__main__":
    import cv2
    
    print("Testing RoadGuard AI fixes...")
    print("=" * 40)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    test_health()
    
    # Wait a moment for server to be ready
    import time
    time.sleep(2)
    
    # Test analysis endpoint
    print("\n2. Testing analysis endpoint...")
    test_api()
    
    print("\n" + "=" * 40)
    print("Test completed!")
