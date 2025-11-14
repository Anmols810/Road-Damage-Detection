/**
 * AI Service for pothole detection and analysis
 * Handles communication with the backend AI API
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface AIAnalysis {
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severity_confidence: number;
  dimensions: {
    width: number;
    length: number;
    depth: number;
  };
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk';
  risk_score: number;
  priority: number;
  area: number;
  volume: number;
  filename?: string;
  file_size?: number;
  image_dimensions?: {
    width: number;
    height: number;
  };
}

export interface AIAnalysisResponse {
  success: boolean;
  analysis: AIAnalysis;
  message: string;
}

export interface ModelInfo {
  model_available: boolean;
  model_path?: string;
  input_size?: [number, number];
  total_parameters?: number;
  model_layers?: number;
  outputs?: {
    severity: string;
    confidence: string;
    dimensions: string;
    risk_level: string;
    priority: string;
  };
}

class AIService {
  private apiClient;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds timeout for AI analysis
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`Making AI API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('AI API request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`AI API response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('AI API response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if the AI service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/health');
      return response.data.status === 'healthy' && response.data.model_available;
    } catch (error) {
      console.error('AI service health check failed:', error);
      return false;
    }
  }

  /**
   * Get information about the loaded AI model
   */
  async getModelInfo(): Promise<ModelInfo> {
    try {
      const response = await this.apiClient.get('/model-info');
      return response.data;
    } catch (error) {
      console.error('Failed to get model info:', error);
      throw new Error('Failed to get AI model information');
    }
  }

  /**
   * Analyze a pothole image
   */
  async analyzePothole(imageFile: File): Promise<AIAnalysis> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await this.apiClient.post<AIAnalysisResponse>(
        '/analyze-pothole',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Analysis failed');
      }

      return response.data.analysis;
    } catch (error) {
      console.error('Pothole analysis failed:', error);
      
      // Return mock analysis if AI service is unavailable
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        console.warn('AI service unavailable, returning mock analysis');
        return this.getMockAnalysis();
      }
      
      throw new Error('Failed to analyze pothole image');
    }
  }

  /**
   * Analyze multiple pothole images in batch
   */
  async analyzePotholeBatch(imageFiles: File[]): Promise<AIAnalysis[]> {
    try {
      const formData = new FormData();
      imageFiles.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await this.apiClient.post('/analyze-pothole-batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error('Batch analysis failed');
      }

      return response.data.results || [];
    } catch (error) {
      console.error('Batch pothole analysis failed:', error);
      throw new Error('Failed to analyze pothole images in batch');
    }
  }

  /**
   * Get a sample analysis for testing/demonstration
   */
  async getSampleAnalysis(): Promise<AIAnalysis> {
    try {
      const response = await this.apiClient.get('/sample-analysis');
      return response.data.analysis;
    } catch (error) {
      console.error('Failed to get sample analysis:', error);
      return this.getMockAnalysis();
    }
  }

  /**
   * Train the AI model (for development/testing)
   */
  async trainModel(): Promise<boolean> {
    try {
      const response = await this.apiClient.post('/train-model');
      return response.data.success;
    } catch (error) {
      console.error('Model training failed:', error);
      return false;
    }
  }

  /**
   * Get mock analysis when AI service is unavailable
   */
  private getMockAnalysis(): AIAnalysis {
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    const riskLevels: Array<'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk'> = [
      'Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'
    ];

    const severity = severities[Math.floor(Math.random() * severities.length)];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];

    const width = Math.round(20 + Math.random() * 50);
    const length = Math.round(25 + Math.random() * 60);
    const depth = Math.round(3 + Math.random() * 15);

    return {
      confidence: 0.75 + Math.random() * 0.2,
      severity,
      severity_confidence: 0.8 + Math.random() * 0.15,
      dimensions: {
        width,
        length,
        depth,
      },
      riskLevel,
      risk_score: Math.random(),
      priority: Math.floor(1 + Math.random() * 10),
      area: width * length,
      volume: width * length * depth,
      filename: 'mock_analysis.jpg',
      file_size: 245760,
      image_dimensions: {
        width: 800,
        height: 600,
      },
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
