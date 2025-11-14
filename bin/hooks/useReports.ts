import { useState, useEffect } from 'react';
import { PotholeReport } from '../types';

// Mock data for demonstration
const mockReports: PotholeReport[] = [
  {
    id: '1',
    location: 'Main Street & 5th Avenue',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    severity: 'high',
    status: 'pending',
    reportedAt: new Date('2024-01-15T10:30:00'),
    reportedBy: 'John Doe',
    description: 'Large pothole causing vehicle damage',
    imageUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    aiAnalysis: {
      confidence: 0.92,
      dimensions: { width: 45, depth: 8, length: 60 },
      riskLevel: 'High Risk'
    },
    priority: 8
  },
  {
    id: '2',
    location: 'Oak Road near School',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    severity: 'critical',
    status: 'in-progress',
    reportedAt: new Date('2024-01-14T14:20:00'),
    reportedBy: 'Sarah Wilson',
    description: 'Deep pothole in school zone - safety hazard',
    imageUrl: 'https://images.pexels.com/photos/2448749/pexels-photo-2448749.jpeg?auto=compress&cs=tinysrgb&w=400',
    aiAnalysis: {
      confidence: 0.96,
      dimensions: { width: 55, depth: 12, length: 70 },
      riskLevel: 'Critical Risk'
    },
    priority: 10,
    assignedTo: 'Mike Johnson'
  },
  {
    id: '3',
    location: 'Elm Street Bridge',
    coordinates: { lat: 40.7505, lng: -73.9934 },
    severity: 'medium',
    status: 'resolved',
    reportedAt: new Date('2024-01-12T09:15:00'),
    reportedBy: 'David Chen',
    description: 'Medium-sized pothole affecting traffic flow',
    imageUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    aiAnalysis: {
      confidence: 0.88,
      dimensions: { width: 30, depth: 5, length: 40 },
      riskLevel: 'Medium Risk'
    },
    priority: 5,
    assignedTo: 'Lisa Brown',
    resolvedAt: new Date('2024-01-13T16:45:00')
  }
];

export const useReports = () => {
  const [reports, setReports] = useState<PotholeReport[]>(mockReports);
  const [loading, setLoading] = useState(false);

  const addReport = (report: Omit<PotholeReport, 'id' | 'reportedAt'>) => {
    const newReport: PotholeReport = {
      ...report,
      id: Date.now().toString(),
      reportedAt: new Date()
    };
    setReports(prev => [newReport, ...prev]);
    return newReport;
  };

  const updateReport = (id: string, updates: Partial<PotholeReport>) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, ...updates } : report
    ));
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(report => report.id !== id));
  };

  return {
    reports,
    loading,
    addReport,
    updateReport,
    deleteReport
  };
};