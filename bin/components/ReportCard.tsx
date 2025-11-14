import React from 'react';
import { MapPin, Calendar, User, AlertTriangle, Target } from 'lucide-react';
import { PotholeReport } from '../types';

interface ReportCardProps {
  report: PotholeReport;
  onUpdate: (id: string, updates: Partial<PotholeReport>) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onUpdate }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (newStatus: PotholeReport['status']) => {
    const updates: Partial<PotholeReport> = { status: newStatus };
    if (newStatus === 'resolved') {
      updates.resolvedAt = new Date();
    }
    onUpdate(report.id, updates);
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Image */}
        {report.imageUrl && (
          <div className="flex-shrink-0">
            <img 
              src={report.imageUrl} 
              alt="Pothole" 
              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
              {report.severity.toUpperCase()}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
              {report.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              Priority: {report.priority}/10
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.location}</h3>
          <p className="text-gray-600 mb-3">{report.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{report.coordinates.lat.toFixed(4)}, {report.coordinates.lng.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{report.reportedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{report.reportedBy}</span>
            </div>
          </div>

          {/* AI Analysis */}
          {report.aiAnalysis && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Analysis</span>
                <span className="text-xs text-blue-600">
                  {Math.round(report.aiAnalysis.confidence * 100)}% confidence
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800">
                <div>Width: {report.aiAnalysis.dimensions.width}cm</div>
                <div>Depth: {report.aiAnalysis.dimensions.depth}cm</div>
                <div>Length: {report.aiAnalysis.dimensions.length}cm</div>
                <div className="font-medium">{report.aiAnalysis.riskLevel}</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <select
            value={report.status}
            onChange={(e) => handleStatusChange(e.target.value as PotholeReport['status'])}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
};