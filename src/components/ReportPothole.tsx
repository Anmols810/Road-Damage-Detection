import React, { useState } from 'react';
import { Upload, MapPin, AlertTriangle, Camera, Loader, CheckCircle } from 'lucide-react';
import { PotholeReport } from '../types';
import { aiService, AIAnalysis } from '../services/aiService';

interface ReportPotholeProps {
  onSubmit: (report: Omit<PotholeReport, 'id' | 'reportedAt'>) => void;
}

export const ReportPothole: React.FC<ReportPotholeProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    severity: 'medium' as PotholeReport['severity'],
    reportedBy: '',
    coordinates: { lat: 0, lng: 0 }
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>();
  const [analysisError, setAnalysisError] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        performAIAnalysis(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const performAIAnalysis = async (imageFile: File) => {
    setAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisError('');
    
    try {
      const analysis = await aiService.analyzePothole(imageFile);
      setAiAnalysis(analysis);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAnalysisError('Failed to analyze image. Please try again.');
      setAnalysisComplete(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to default coordinates
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: 40.7128, lng: -74.0060 }
          }));
        },
        {
          timeout: 3000,
          enableHighAccuracy: false,
          maximumAge: 60000 // Accept cached position up to 1 minute old
        }
      );
    } else {
      // Fallback if geolocation is not supported
      setFormData(prev => ({
        ...prev,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priority = formData.severity === 'critical' ? 10 : 
                    formData.severity === 'high' ? 8 :
                    formData.severity === 'medium' ? 5 : 3;

    onSubmit({
      ...formData,
      status: 'pending',
      imageUrl: imagePreview || 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
      aiAnalysis: aiAnalysis ? {
        confidence: aiAnalysis.confidence,
        dimensions: aiAnalysis.dimensions,
        riskLevel: aiAnalysis.riskLevel
      } : undefined,
      priority
    });

    // Reset form
    setFormData({
      location: '',
      description: '',
      severity: 'medium',
      reportedBy: '',
      coordinates: { lat: 0, lng: 0 }
    });
    setImage(null);
    setImagePreview('');
    setAiAnalysis(undefined);
    setAnalysisComplete(false);
  };

  React.useEffect(() => {
    // Get location on component mount
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">Report a Pothole</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  {analyzing && (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing image with AI...</span>
                    </div>
                  )}
                  {analysisComplete && aiAnalysis && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Analysis complete! ({Math.round(aiAnalysis.confidence * 100)}% confidence)</span>
                    </div>
                  )}
                  {analysisError && (
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{analysisError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">AI Analysis Results</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                <div>Confidence: {Math.round(aiAnalysis.confidence * 100)}%</div>
                <div>Risk Level: {aiAnalysis.riskLevel}</div>
                <div>Dimensions: {aiAnalysis.dimensions.width}×{aiAnalysis.dimensions.length}×{aiAnalysis.dimensions.depth}cm</div>
                <div>Priority: {aiAnalysis.priority}/10</div>
                <div>Severity: {aiAnalysis.severity}</div>
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Main Street & 5th Avenue"
              />
            </div>
            {formData.coordinates.lat !== 0 && (
              <p className="text-xs text-gray-500 mt-1">
                GPS: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the pothole and any damage it has caused..."
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as PotholeReport['severity'] }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low - Minor surface damage</option>
              <option value="medium">Medium - Noticeable hole</option>
              <option value="high">High - Large pothole</option>
              <option value="critical">Critical - Dangerous to vehicles</option>
            </select>
          </div>

          {/* Reporter Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              value={formData.reportedBy}
              onChange={(e) => setFormData(prev => ({ ...prev, reportedBy: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};