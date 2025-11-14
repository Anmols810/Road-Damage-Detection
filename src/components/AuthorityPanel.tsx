import React, { useState } from 'react';
import { Shield, Phone, Mail, MapPin, Calendar, User } from 'lucide-react';
import { PotholeReport } from '../types';

interface AuthorityPanelProps {
  reports: PotholeReport[];
  onUpdateReport: (id: string, updates: Partial<PotholeReport>) => void;
}

export const AuthorityPanel: React.FC<AuthorityPanelProps> = ({ reports, onUpdateReport }) => {
  const [selectedReport, setSelectedReport] = useState<PotholeReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'critical'>('all');

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'critical') return report.severity === 'critical';
    return report.status === filter;
  });

  const handleAssign = (reportId: string, assignee: string) => {
    onUpdateReport(reportId, { 
      assignedTo: assignee,
      status: 'in-progress'
    });
  };

  const handlePriorityChange = (reportId: string, priority: number) => {
    onUpdateReport(reportId, { priority });
  };

  const urgentReports = reports.filter(r => r.severity === 'critical' && r.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Authority Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{urgentReports.length}</div>
            <div className="text-sm text-red-800">Urgent Reports</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.status === 'in-progress').length}
            </div>
            <div className="text-sm text-blue-800">In Progress</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-sm text-green-800">Resolved</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Reports' },
            { key: 'pending', label: 'Pending' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'critical', label: 'Critical' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Reports ({filteredReports.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredReports.map(report => (
            <div key={report.id} className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Report Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.location}</h4>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        report.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        report.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{report.reportedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{report.reportedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{report.coordinates.lat.toFixed(4)}, {report.coordinates.lng.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {report.aiAnalysis && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="text-sm">
                        <strong>AI Analysis:</strong> {Math.round(report.aiAnalysis.confidence * 100)}% confidence, 
                        {report.aiAnalysis.dimensions.width}×{report.aiAnalysis.dimensions.length}×{report.aiAnalysis.dimensions.depth}cm, 
                        {report.aiAnalysis.riskLevel}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 space-y-3 min-w-[200px]">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={report.priority}
                      onChange={(e) => handlePriorityChange(report.id, parseInt(e.target.value))}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Assign To</label>
                    <select
                      value={report.assignedTo || ''}
                      onChange={(e) => handleAssign(report.id, e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      <option value="Mike Johnson">Mike Johnson</option>
                      <option value="Sarah Wilson">Sarah Wilson</option>
                      <option value="David Chen">David Chen</option>
                      <option value="Lisa Brown">Lisa Brown</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      <Phone className="h-3 w-3 inline mr-1" />
                      Call
                    </button>
                    <button className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                      <Mail className="h-3 w-3 inline mr-1" />
                      Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};