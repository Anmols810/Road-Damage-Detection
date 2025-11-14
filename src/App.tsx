import React, { useState } from 'react';
import { MapPin, Plus, BarChart3, Shield, Menu, X } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ReportPothole } from './components/ReportPothole';
import { AuthorityPanel } from './components/AuthorityPanel';
import { Analytics } from './components/Analytics';
import { useReports } from './hooks/useReports';

type ActiveTab = 'dashboard' | 'report' | 'authority' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { reports, addReport, updateReport } = useReports();

  const handleReportSubmit = (reportData: Parameters<typeof addReport>[0]) => {
    addReport(reportData);
    setActiveTab('dashboard');
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: MapPin },
    { id: 'report', label: 'Report Pothole', icon: Plus },
    { id: 'authority', label: 'Authority Panel', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard reports={reports} onUpdateReport={updateReport} />;
      case 'report':
        return <ReportPothole onSubmit={handleReportSubmit} />;
      case 'authority':
        return <AuthorityPanel reports={reports} onUpdateReport={updateReport} />;
      case 'analytics':
        return <Analytics reports={reports} />;
      default:
        return <Dashboard reports={reports} onUpdateReport={updateReport} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RoadGuard AI</h1>
                <p className="text-xs text-gray-600">Smart Pothole Detection System</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as ActiveTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {navigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id as ActiveTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>© 2024 RoadGuard AI. Making roads safer with AI technology.</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Emergency: 911</span>
              <span>•</span>
              <span>Support: (555) 123-4567</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;