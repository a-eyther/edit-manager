import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, Filter, X, Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import {
  fetchAuditTrail,
  exportAnalytics,
  selectAuditTrail,
  selectAuditPagination,
  selectAuditFilters,
  selectIsAuditLoading,
  selectError,
  setAuditFilters,
  clearAuditFilters,
  setAuditPage,
  selectIsExporting
} from '../../../store/slices/analyticsSlice';
import DataTable from '../../common/DataTable';
import PageHeader from '../../common/PageHeader';
import { AuditEventType } from '../../../types/api-contracts';

/**
 * Audit Log Page Component
 *
 * Full page component for viewing system audit trail.
 * Includes filtering, searching, and export capabilities.
 *
 * @returns {JSX.Element}
 */
const AuditLogPage = () => {
  const dispatch = useDispatch();

  const auditEntries = useSelector(selectAuditTrail);
  const pagination = useSelector(selectAuditPagination);
  const filters = useSelector(selectAuditFilters);
  const isLoading = useSelector(selectIsAuditLoading);
  const isExporting = useSelector(selectIsExporting);
  const error = useSelector(selectError);

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Fetch audit trail on mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchAuditTrail());
  }, [dispatch, filters, pagination.page]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setAuditFilters({ search: searchInput }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setAuditFilters({ [key]: value }));
  };

  const handleEventTypeToggle = (eventType) => {
    const currentTypes = filters.eventTypes || [];
    const newTypes = currentTypes.includes(eventType)
      ? currentTypes.filter(t => t !== eventType)
      : [...currentTypes, eventType];
    dispatch(setAuditFilters({ eventTypes: newTypes }));
  };

  const handleClearFilters = () => {
    dispatch(clearAuditFilters());
    setSearchInput('');
  };

  const handlePageChange = (page) => {
    dispatch(setAuditPage(page));
  };

  const handleExport = async () => {
    try {
      await dispatch(exportAnalytics({
        type: 'audit',
        ...filters
      })).unwrap();
      alert('Audit log exported successfully! (In production, this would download a CSV file)');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export audit log');
    }
  };

  const toggleRowExpansion = (entryId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedRows(newExpanded);
  };

  const hasActiveFilters = filters.eventTypes?.length > 0 || filters.claimId || filters.userId || filters.startDate || filters.endDate || filters.search;

  // Event type badge colors
  const getEventTypeBadgeColor = (eventType) => {
    const colorMap = {
      [AuditEventType.CLAIM_ASSIGNED]: 'bg-blue-100 text-blue-700',
      [AuditEventType.CLAIM_REASSIGNED]: 'bg-purple-100 text-purple-700',
      [AuditEventType.CLAIM_FORCE_REASSIGNED]: 'bg-orange-100 text-orange-700',
      [AuditEventType.CLAIM_AUTO_REASSIGNED]: 'bg-indigo-100 text-indigo-700',
      [AuditEventType.CLAIM_ADJUDICATED]: 'bg-green-100 text-green-700',
      [AuditEventType.CLAIM_RE_ADJUDICATED]: 'bg-yellow-100 text-yellow-700',
      [AuditEventType.USER_CREATED]: 'bg-emerald-100 text-emerald-700',
      [AuditEventType.USER_ACTIVATED]: 'bg-teal-100 text-teal-700',
      [AuditEventType.USER_DEACTIVATED]: 'bg-red-100 text-red-700',
      [AuditEventType.PASSWORD_RESET_INITIATED]: 'bg-pink-100 text-pink-700'
    };
    return colorMap[eventType] || 'bg-gray-100 text-gray-700';
  };

  // Audit table columns
  const columns = [
    {
      key: 'expand',
      header: '',
      sortable: false,
      render: (_, entry) => (
        <button
          onClick={() => toggleRowExpansion(entry.id)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {expandedRows.has(entry.id) ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'eventType',
      header: 'Event Type',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeBadgeColor(value)}`}>
          {value.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'performedByName',
      header: 'Performed By',
      render: (value) => <span className="text-sm font-medium text-gray-900">{value}</span>
    },
    {
      key: 'claimId',
      header: 'Claim ID',
      render: (value) => value ? (
        <span className="text-sm text-gray-900">{value}</span>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      )
    },
    {
      key: 'userName',
      header: 'User',
      render: (value) => value ? (
        <span className="text-sm text-gray-900">{value}</span>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      )
    }
  ];

  // Expandable row content
  const ExpandedRowContent = ({ entry }) => (
    <tr>
      <td colSpan={columns.length} className="px-6 py-4 bg-gray-50">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Event Details</h4>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(entry.details, null, 2)}
              </pre>
            </div>
          </div>
          {entry.ipAddress && (
            <div className="text-xs text-gray-600">
              IP Address: <span className="font-mono">{entry.ipAddress}</span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  // Custom table with expandable rows
  const AuditTable = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-gray-600">Loading audit log...</span>
                  </div>
                </td>
              </tr>
            ) : auditEntries.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  No audit entries found
                </td>
              </tr>
            ) : (
              auditEntries.map((entry) => (
                <>
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render ? column.render(entry[column.key], entry) : entry[column.key]}
                      </td>
                    ))}
                  </tr>
                  {expandedRows.has(entry.id) && <ExpandedRowContent entry={entry} />}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium
                         text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium
                         text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <PageHeader title="Audit Log" />

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-600">
          Track all system activities, user actions, and claim modifications
        </p>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search claim ID, user name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                           transition-colors border
                           ${hasActiveFilters || showFilters
                             ? 'bg-primary-50 text-primary-700 border-primary-300'
                             : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                           }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                    {[filters.eventTypes?.length, filters.claimId, filters.userId, filters.startDate, filters.search].filter(Boolean).length}
                  </span>
                )}
              </button>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
                           bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Export to CSV'}</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Event Types */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Types
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(AuditEventType).map((eventType) => (
                      <label key={eventType} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.eventTypes?.includes(eventType) || false}
                          onChange={() => handleEventTypeToggle(eventType)}
                          className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500 rounded"
                        />
                        <span className="text-gray-700">{eventType.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Claim ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim ID
                  </label>
                  <input
                    type="text"
                    value={filters.claimId || ''}
                    onChange={(e) => handleFilterChange('claimId', e.target.value || null)}
                    placeholder="CLM-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={filters.userId || ''}
                    onChange={(e) => handleFilterChange('userId', e.target.value || null)}
                    placeholder="EDR-2000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Audit Table */}
        <AuditTable />
      </div>
    </div>
  );
};

export default AuditLogPage;
