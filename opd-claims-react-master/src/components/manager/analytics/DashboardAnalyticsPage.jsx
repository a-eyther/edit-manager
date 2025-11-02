import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, Calendar, User, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  fetchEditorAnalytics,
  exportAnalytics,
  selectEditorAnalytics,
  selectIsEditorAnalyticsLoading,
  selectError,
  setDateRange,
  selectEditorAnalyticsDateRange,
  selectIsExporting
} from '../../../store/slices/analyticsSlice';
import { fetchActiveEditors, selectActiveEditors } from '../../../store/slices/editManagerSlice';
import DataTable from '../../common/DataTable';
import PageHeader from '../../common/PageHeader';
import CapacityViewWidget from '../shared/CapacityViewWidget';

/**
 * Dashboard Analytics Page Component
 *
 * Unified page that shows:
 * 1. General dashboard with team capacity overview (CapacityViewWidget)
 * 2. Individual editor analytics on user selection
 *
 * Flow: General Dashboard → Individual Analytics
 *
 * @returns {JSX.Element}
 */
const DashboardAnalyticsPage = () => {
  const dispatch = useDispatch();

  const analytics = useSelector(selectEditorAnalytics);
  const editors = useSelector(selectActiveEditors);
  const isLoading = useSelector(selectIsEditorAnalyticsLoading);
  const isExporting = useSelector(selectIsExporting);
  const error = useSelector(selectError);
  const dateRange = useSelector(selectEditorAnalyticsDateRange);

  const [selectedEditor, setSelectedEditor] = useState('');
  const [startDate, setStartDate] = useState(
    dateRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    dateRange.endDate || new Date().toISOString().split('T')[0]
  );
  const [showGeneralDashboard, setShowGeneralDashboard] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Ref for scrolling to individual analytics section
  const individualAnalyticsRef = useRef(null);

  // Fetch editors on mount
  useEffect(() => {
    dispatch(fetchActiveEditors());
  }, [dispatch]);

  // Fetch analytics when editor is selected
  useEffect(() => {
    if (selectedEditor && startDate && endDate) {
      dispatch(fetchEditorAnalytics({
        editorId: selectedEditor,
        startDate,
        endDate
      }));
    }
  }, [selectedEditor, startDate, endDate, dispatch]);

  const handleEditorChange = (editorId) => {
    setSelectedEditor(editorId);
    // Collapse general dashboard when editor is selected
    if (editorId) {
      setShowGeneralDashboard(false);
    }
  };

  const handleExport = async () => {
    if (!selectedEditor || !analytics) return;

    try {
      await dispatch(exportAnalytics({
        type: 'editor',
        editorId: selectedEditor,
        startDate,
        endDate
      })).unwrap();

      alert('Analytics exported successfully! (In production, this would download a CSV file)');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export analytics');
    }
  };

  const handleEditorClick = (editor) => {
    // Select the editor in dropdown
    setSelectedEditor(editor.id);
    // Collapse team overview
    setShowGeneralDashboard(false);
    // Scroll to individual analytics section
    setTimeout(() => {
      individualAnalyticsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // Metric Card Component
  const MetricCard = ({ icon: Icon, label, value, change, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );

  // Recent Claims Table Columns
  const recentClaimsColumns = [
    {
      key: 'visitNumber',
      header: 'Visit Number',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    {
      key: 'patientName',
      header: 'Patient',
      render: (value) => <span className="text-gray-900">{value}</span>
    },
    {
      key: 'editStatus',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'ADJUDICATED' ? 'bg-green-100 text-green-700' :
          value === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (value) => {
        if (!value) return <span className="text-gray-400">-</span>;
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
            value === 'APPROVED' ? 'text-green-700' :
            value === 'REJECTED' ? 'text-red-700' :
            'text-yellow-700'
          }`}>
            {value === 'APPROVED' && <CheckCircle className="w-3.5 h-3.5" />}
            {value === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
            {value === 'PARTIAL' && <AlertCircle className="w-3.5 h-3.5" />}
            <span>{value}</span>
          </span>
        );
      }
    },
    {
      key: 'adjudicatedAt',
      header: 'Completed',
      render: (value) => {
        if (!value) return <span className="text-gray-400">-</span>;
        return (
          <span className="text-sm text-gray-600">
            {new Date(value).toLocaleDateString()}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader title="Analytics Dashboard" />

      <div className="p-6 space-y-6">
        {/* General Dashboard Section */}
        <div className="space-y-4">
          {/* Collapsible Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Team Overview</h2>
              <p className="text-sm text-gray-600">
                Monitor team capacity and overall performance metrics
              </p>
            </div>
            <button
              onClick={() => setShowGeneralDashboard(!showGeneralDashboard)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {showGeneralDashboard ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide Overview</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show Overview</span>
                </>
              )}
            </button>
          </div>

          {/* Capacity View Widget (Collapsible) */}
          {showGeneralDashboard && (
            <div className="animate-fade-in">
              <CapacityViewWidget onEditorClick={handleEditorClick} />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300"></div>

        {/* Individual Editor Analytics Section */}
        <div className="space-y-4" ref={individualAnalyticsRef}>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Individual Editor Analytics</h2>
            <p className="text-sm text-gray-600">
              Select an editor to view detailed performance metrics and productivity insights
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Editor Selector */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Editor
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedEditor}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  >
                    <option value="">Select an editor...</option>
                    {editors.map(editor => (
                      <option key={editor.id} value={editor.id}>
                        {editor.name} - {editor.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleExport}
                disabled={!analytics || isExporting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
                           bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Export to CSV'}</span>
              </button>
            </div>
          </div>

          {/* Selected Editor Display */}
          {selectedEditor && editors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Viewing analytics for</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {editors.find(e => e.id === selectedEditor)?.name || 'Unknown Editor'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
          )}

          {/* Analytics Content */}
          {!isLoading && analytics && selectedEditor && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  icon={CheckCircle}
                  label="Claims Processed"
                  value={analytics.keyMetrics.claimsAdjudicated}
                />
                <MetricCard
                  icon={Clock}
                  label="Avg Processing Time"
                  value={`${analytics.averageProcessingTime} min`}
                />
                <MetricCard
                  icon={TrendingUp}
                  label="LCT Agreement Rate"
                  value={`${Math.round((analytics.outcomes.approved / analytics.keyMetrics.claimsAdjudicated) * 100)}%`}
                />
              </div>

              {/* Outcome Distribution */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Outcome Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {analytics.outcomes.approved}
                    </div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                      {analytics.outcomes.partiallyApproved}
                    </div>
                    <div className="text-sm text-gray-600">Partially Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {analytics.outcomes.rejected}
                    </div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                </div>
              </div>

              {/* Quality Indicators */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Indicators</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analytics.qualityIndicators.managerReEdits}
                    </div>
                    <div className="text-xs text-gray-600">Manager Re-Edits</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analytics.qualityIndicators.vettingApproved}
                    </div>
                    <div className="text-xs text-gray-600">Vetting Approved</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analytics.qualityIndicators.vettingRejected}
                    </div>
                    <div className="text-xs text-gray-600">Vetting Rejected</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analytics.qualityIndicators.reassignmentCount}
                    </div>
                    <div className="text-xs text-gray-600">Reassignments</div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('active')}
                      className={`
                        px-6 py-3 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === 'active'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }
                      `}
                    >
                      Active Claims
                    </button>
                    <button
                      onClick={() => setActiveTab('adjudicated')}
                      className={`
                        px-6 py-3 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === 'adjudicated'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }
                      `}
                    >
                      Adjudicated Claims
                    </button>
                  </nav>
                </div>
              </div>

              {/* Claims Table (Filtered by Tab) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {activeTab === 'active' ? 'Active Claims' : 'Adjudicated Claims'}
                </h3>
                <DataTable
                  columns={recentClaimsColumns}
                  data={
                    activeTab === 'active'
                      ? (analytics.recentClaims || []).filter(claim =>
                          ['PENDING', 'IN_PROGRESS', 'ASSIGNED'].includes(claim.editStatus)
                        )
                      : (analytics.recentClaims || []).filter(claim =>
                          ['ADJUDICATED', 'RE_ADJUDICATED', 'COMPLETED', 'EDITED'].includes(claim.editStatus)
                        )
                  }
                  rowsPerPage={10}
                />
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && !selectedEditor && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-2">No editor selected</p>
              <p className="text-sm text-gray-500">
                Select an editor from the dropdown above to view their detailed analytics
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalyticsPage;
