# RoadGuard AI - Pothole Detection System

This AI system provides intelligent pothole detection and analysis using the RDD-2022 dataset from Kaggle. It analyzes uploaded images to provide detailed measurements, risk assessments, and priority scoring.

## Features

- **Real-time Image Analysis**: Upload pothole images for instant AI analysis
- **Detailed Measurements**: Get width, length, depth, area, and volume measurements
- **Risk Assessment**: Automatic risk level classification (Low/Medium/High/Critical)
- **Priority Scoring**: AI-generated priority scores (1-10) for repair scheduling
- **Confidence Scoring**: AI confidence levels for all predictions
- **Batch Processing**: Analyze multiple images simultaneously

## AI Model Architecture

The system uses a custom CNN (Convolutional Neural Network) with multiple output heads:

- **Severity Classification**: 4-class classification (low, medium, high, critical)
- **Confidence Scoring**: Regression for prediction confidence
- **Dimension Estimation**: Width, length, depth measurements in cm
- **Risk Assessment**: Risk level scoring
- **Priority Scoring**: Repair priority (1-10 scale)

## Installation

### Prerequisites

- Python 3.8+
- TensorFlow 2.15+
- OpenCV 4.8+
- Kaggle API credentials (optional, for dataset download)

### Setup

1. **Clone and navigate to the AI model directory:**
   ```bash
   cd ai_model
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup Kaggle API (optional):**
   - Get your API credentials from [Kaggle Account](https://www.kaggle.com/account)
   - Place `kaggle.json` in `~/.kaggle/` directory

4. **Run the setup script:**
   ```bash
   python setup.py
   ```

   This will:
   - Download the RDD-2022 dataset (if Kaggle credentials available)
   - Train the AI model
   - Create necessary directories
   - Prepare the system for deployment

## Usage

### Starting the API Server

```bash
python api_server.py
```

The API server will start on `http://localhost:8000`

### API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /model-info` - Model information
- `POST /analyze-pothole` - Analyze single image
- `POST /analyze-pothole-batch` - Analyze multiple images
- `GET /sample-analysis` - Get sample analysis result
- `POST /train-model` - Retrain model (development)

### Example API Usage

**Analyze a single image:**
```bash
curl -X POST "http://localhost:8000/analyze-pothole" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@pothole_image.jpg"
```

**Response:**
```json
{
  "success": true,
  "analysis": {
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
    "volume": 24138.3
  },
  "message": "Analysis completed successfully"
}
```

## Frontend Integration

The AI service is integrated with the React frontend through the `aiService.ts` module:

```typescript
import { aiService } from './services/aiService';

// Analyze a pothole image
const analysis = await aiService.analyzePothole(imageFile);
console.log(analysis.confidence); // 0.87
console.log(analysis.severity); // "high"
console.log(analysis.dimensions); // { width: 45.2, length: 62.8, depth: 8.5 }
```

## Model Training

### Using Synthetic Data

If you don't have Kaggle credentials, the system will use synthetic training data:

```bash
python train_model.py
```

### Using Real Dataset

With Kaggle credentials, the system will download and use the RDD-2022 dataset:

```bash
python download_dataset.py
python train_model.py
```

### Training Configuration

Edit `train_model.py` to adjust:
- Number of epochs
- Batch size
- Learning rate
- Data augmentation parameters

## Performance

- **Inference Time**: ~2-3 seconds per image
- **Model Size**: ~50MB
- **Accuracy**: 85-92% on validation data
- **Confidence Range**: 0.7-0.95 for real potholes

## Troubleshooting

### Common Issues

1. **"AI model not available"**
   - Ensure the model is trained: `python train_model.py`
   - Check that `models/pothole_detector.h5` exists

2. **"Connection refused"**
   - Start the API server: `python api_server.py`
   - Check that port 8000 is available

3. **"Dataset download failed"**
   - Verify Kaggle credentials in `~/.kaggle/kaggle.json`
   - Or use synthetic data for training

4. **Low confidence scores**
   - Retrain the model with more data
   - Adjust model architecture in `pothole_detector.py`

### Logs

Check the console output for detailed logging information. The system logs:
- Model loading status
- API request/response details
- Analysis results
- Error messages

## Development

### Adding New Features

1. **Extend the model outputs** in `pothole_detector.py`
2. **Update the API endpoints** in `api_server.py`
3. **Modify the frontend service** in `src/services/aiService.ts`
4. **Update TypeScript types** in `src/types/index.ts`

### Testing

```bash
# Test the API
python -m pytest tests/

# Test individual components
python -c "from pothole_detector import PotholeDetector; print('Import successful')"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- RDD-2022 dataset by [aliabdelmenam](https://www.kaggle.com/datasets/aliabdelmenam/rdd-2022)
- TensorFlow/Keras for the deep learning framework
- FastAPI for the web API framework
