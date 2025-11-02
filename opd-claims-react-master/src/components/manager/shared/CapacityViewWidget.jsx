import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Activity, Clock, TrendingUp, RefreshCw, CheckCircle } from 'lucide-react';
import {
  fetchCapacityView,
  selectCapacityView,
  selectIsCapacityLoading,
  selectError
} from '../../../store/slices/analyticsSlice';

/**
 * Capacity View Widget Component
 *
 * Real-time display of editor capacity and workload distribution.
 * Auto-refreshes every 30 seconds.
 *
 * @param {Object} props
 * @param {Function} props.onEditorClick - Callback when editor name is clicked
 * @returns {JSX.Element}
 */
const CapacityViewWidget = ({ onEditorClick }) => {
  const dispatch = useDispatch();
  const capacityData = useSelector(selectCapacityView);
  const isLoading = useSelector(selectIsCapacityLoading);
  const error = useSelector(selectError);

  // Fetch capacity data on mount
  useEffect(() => {
    dispatch(fetchCapacityView());

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchCapacityView());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCapacityView());
  };

  // Determine load level color
  const getLoadLevelColor = (percentage) => {
    if (percentage >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getLoadLevelIndicator = (percentage) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">Failed to load capacity data</div>
          <button
            onClick={handleRefresh}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team Capacity</h3>
              <p className="text-xs text-gray-500">
                Real-time editor workload distribution
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh capacity data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {capacityData && (
        <>
          <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {capacityData.totalEditors}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total Editors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {capacityData.activeEditors}
              </div>
              <div className="text-xs text-gray-600 mt-1">Active Claims</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                29
              </div>
              <div className="text-xs text-gray-600 mt-1">Total Claims</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {capacityData.averageQueueSize.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 mt-1">Avg Queue</div>
            </div>
          </div>

          {/* Editor List */}
          <div className="px-6 py-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {capacityData.editors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No editors available
                </div>
              ) : (
                capacityData.editors.map((editor) => (
                  <div
                    key={editor.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-200
                               hover:bg-gray-50 transition-colors"
                  >
                    {/* Status Indicator */}
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        editor.status === 'ACTIVE'
                          ? getLoadLevelIndicator(editor.capacityPercentage)
                          : 'bg-gray-300'
                      }`}
                      title={editor.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    ></div>

                    {/* Editor Info */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onEditorClick && onEditorClick(editor)}
                        className="font-medium text-gray-900 truncate hover:text-primary-600 transition-colors cursor-pointer text-left"
                      >
                        {editor.name}
                      </button>
                      <div className="text-xs text-gray-500">
                        {editor.status === 'ACTIVE' ? (
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {editor.claimsInProgress} in progress
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {editor.claimsPending} pending
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {editor.claimsAdjudicatedToday || 0} adjudicated today
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Inactive</span>
                        )}
                      </div>
                    </div>

                    {/* Queue Count & Capacity */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {editor.claimsAssigned}
                        </div>
                        <div className="text-xs text-gray-500">in queue</div>
                      </div>

                      {editor.status === 'ACTIVE' && (
                        <div className={`
                          px-3 py-1 rounded-full text-xs font-semibold border
                          ${getLoadLevelColor(editor.capacityPercentage)}
                        `}>
                          {editor.capacityPercentage}%
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Low (&lt; 60%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Medium (60-80%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>High (&gt; 80%)</span>
                </div>
              </div>
              {capacityData.lastUpdated && (
                <span className="text-gray-500">
                  Updated: {new Date(capacityData.lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && !capacityData && (
        <div className="px-6 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading capacity data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityViewWidget;
