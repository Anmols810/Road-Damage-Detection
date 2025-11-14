import React from 'react';
import { MapPin, AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { PotholeReport } from '../types';
import { ReportCard } from './ReportCard';

interface DashboardProps {
  reports: PotholeReport[];
  onUpdateReport: (id: string, updates: Partial<PotholeReport>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ reports, onUpdateReport }) => {
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    critical: reports.filter(r => r.severity === 'critical').length
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          <p className="text-sm text-gray-600 mt-1">Sorted by priority and date</p>
        </div>
        <div className="divide-y divide-gray-100">
          {sortedReports.length > 0 ? (
            sortedReports.map(report => (
              <ReportCard 
                key={report.id} 
                report={report} 
                onUpdate={onUpdateReport}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reports found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};