import React from 'react';
import { BarChart3, TrendingUp, MapPin, Clock, CheckCircle } from 'lucide-react';
import { PotholeReport } from '../types';

interface AnalyticsProps {
  reports: PotholeReport[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ reports }) => {
  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;
  const avgResolutionTime = resolvedReports > 0 ? 
    reports
      .filter(r => r.status === 'resolved' && r.resolvedAt)
      .reduce((sum, r) => {
        const days = Math.floor((r.resolvedAt!.getTime() - r.reportedAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / resolvedReports : 0;

  const severityStats = {
    critical: reports.filter(r => r.severity === 'critical').length,
    high: reports.filter(r => r.severity === 'high').length,
    medium: reports.filter(r => r.severity === 'medium').length,
    low: reports.filter(r => r.severity === 'low').length
  };

  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      reports: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 15) + 3
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
              <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0}%
              </p>
              <p className="text-xs text-green-600 mt-1">↑ 5% from last month</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">{avgResolutionTime.toFixed(1)} days</p>
              <p className="text-xs text-red-600 mt-1">↑ 0.5 days from last month</p>
            </div>
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center gap-4">
                <div className="w-8 text-sm font-medium text-gray-600">{data.month}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.reports / 25) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8">{data.reports}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.resolved / 25) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8">{data.resolved}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span>Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Severity Distribution</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(severityStats).map(([severity, count]) => {
              const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
              const colors = {
                critical: 'bg-red-600',
                high: 'bg-orange-600',
                medium: 'bg-yellow-600',
                low: 'bg-green-600'
              };
              
              return (
                <div key={severity} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-gray-600 capitalize">
                    {severity}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`${colors[severity as keyof typeof colors]} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};