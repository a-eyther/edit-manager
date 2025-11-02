import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import EditFilters from './components/EditFilters';
import { editManagementColumns } from './constants/columns';
import claimsService from '../../services/claimsService';
import ReassignmentModal from '../../components/manager/edit-manager/ReassignmentModal';
import {
  toggleBulkSelection,
  selectAllClaims,
  clearBulkSelection,
  selectBulkSelection,
  bulkReassign,
  selectIsLoading,
  selectReassignmentModal,
  closeReassignmentModal,
  standardReassign,
  forceReassign
} from '../../store/slices/reassignmentSlice';

/**
 * Edit Management Page
 * Displays claims data with stats, search, and table
 */
const EditManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedClaims = useSelector(selectBulkSelection);
  const isReassigning = useSelector(selectIsLoading);
  const reassignmentModal = useSelector(selectReassignmentModal);

  const isInitialMount = useRef(true);
  const isSearchInitialized = useRef(
    sessionStorage.getItem('editManagement_searchInitialized') === 'true'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const prevSearchQuery = useRef('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkReassignModal, setShowBulkReassignModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [filters, setFilters] = useState({
    decision: 'All Decisions',
    provider: 'All Providers',
    benefitType: 'All Benefit Types',
    amountMin: '',
    amountMax: '',
    startDate: '',
    endDate: '',
    dateRange: 'All Time'
  });

  // Track previous filters to detect actual changes
  const prevFiltersRef = useRef(filters);

  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClaims: 0,
    editDone: 0,
    editPending: 0
  });
  const [currentPage, setCurrentPage] = useState(() => {
    // Restore saved page from sessionStorage
    const savedPage = sessionStorage.getItem('editManagement_currentPage');
    const page = savedPage ? parseInt(savedPage, 10) : 1;
    console.log('EditManagement: Initializing currentPage from sessionStorage:', page);
    return page;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    // Restore saved page size from sessionStorage
    const savedPageSize = sessionStorage.getItem('editManagement_pageSize');
    return savedPageSize ? parseInt(savedPageSize, 10) : 10;
  });

  // Fetch claims with filters - wrapped in useCallback to avoid stale closures
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Always include claim_type
      params.append('claim_type', 'OPD');

      // Add search query if present
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Add decision filter (final_decision in API)
      if (filters.decision && filters.decision !== 'All Decisions') {
        params.append('final_decision', filters.decision);
      }

      // Add provider filter (provider_name in API)
      if (filters.provider && filters.provider !== 'All Providers') {
        params.append('provider_name', filters.provider);
      }

      // Add benefit type filter (benefit_name in API)
      if (filters.benefitType && filters.benefitType !== 'All Benefit Types') {
        params.append('benefit_name', filters.benefitType);
      }

      // Add date range filters
      if (filters.startDate) {
        params.append('start_date', filters.startDate);
      }
      if (filters.endDate) {
        params.append('end_date', filters.endDate);
      }

      // Add amount range filters
      if (filters.amountMin) {
        params.append('min_amount', filters.amountMin);
      }
      if (filters.amountMax) {
        params.append('max_amount', filters.amountMax);
      }

      // Add pagination
      params.append('page', currentPage.toString());
      params.append('page_size', pageSize.toString());

      // Convert URLSearchParams to plain object for claimsService
      const paramsObj = Object.fromEntries(params.entries());
      const response = await claimsService.getClaims(paramsObj);
      const claims = response.results || [];
      setClaimsData(claims);

      // Calculate total pages from API count
      const totalClaims = response.count || claims.length;
      const calculatedTotalPages = Math.ceil(totalClaims / pageSize);
      setTotalPages(calculatedTotalPages);

      // Use stats from API response
      setStats({
        totalClaims,
        editDone: response.edit_done_count || 0,
        editPending: response.edit_pending_count || 0
      });
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchQuery, pageSize]);

  // Fetch data when dependencies change
  useEffect(() => {
    console.log('EditManagement: fetchClaims useEffect triggered, currentPage:', currentPage);
    fetchClaims();
  }, [fetchClaims]);

  // Reset to page 1 when filters actually change (not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('EditManagement: Initial mount, skipping filter reset');
      isInitialMount.current = false;
      return;
    }

    // Check if filters actually changed
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    console.log('EditManagement: Filters changed?', filtersChanged);
    if (filtersChanged) {
      console.log('EditManagement: Resetting to page 1 due to filter change');
      setCurrentPage(1);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  // Reset to page 1 when search changes (debounced, not on initial mount)
  useEffect(() => {
    if (!isSearchInitialized.current) {
      console.log('EditManagement: First search render, skipping reset');
      isSearchInitialized.current = true;
      sessionStorage.setItem('editManagement_searchInitialized', 'true');
      prevSearchQuery.current = searchQuery;
      return;
    }

    // Only reset if search query actually changed
    if (prevSearchQuery.current === searchQuery) {
      console.log('EditManagement: Search query unchanged, skipping reset');
      return;
    }

    console.log('EditManagement: Search query changed from', prevSearchQuery.current, 'to', searchQuery);
    prevSearchQuery.current = searchQuery;

    const timeoutId = setTimeout(() => {
      console.log('EditManagement: Resetting to page 1 due to search query change');
      setCurrentPage(1);
    }, 1000); // 1000ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Save current page to sessionStorage whenever it changes
  useEffect(() => {
    console.log('EditManagement: Saving currentPage to sessionStorage:', currentPage);
    sessionStorage.setItem('editManagement_currentPage', currentPage.toString());
  }, [currentPage]);

  // Save page size to sessionStorage whenever it changes
  useEffect(() => {
    console.log('EditManagement: Saving pageSize to sessionStorage:', pageSize);
    sessionStorage.setItem('editManagement_pageSize', pageSize.toString());
  }, [pageSize]);

  // Handle page size change - reset to page 1
  const handlePageSizeChange = (newPageSize) => {
    console.log('EditManagement: Page size changed to:', newPageSize);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle bulk reassignment
  const handleBulkReassign = async (reassignmentData) => {
    try {
      await dispatch(bulkReassign({
        claimIds: selectedClaims,
        toEditorId: reassignmentData.toEditorId,
        reason: reassignmentData.reason
      })).unwrap();

      // Show success notification
      setNotification({
        type: 'success',
        message: `Successfully reassigned ${selectedClaims.length} claim(s)`
      });

      // Close modal and refresh data
      setShowBulkReassignModal(false);
      fetchClaims();
    } catch (error) {
      // Show error notification
      setNotification({
        type: 'error',
        message: error || 'Failed to reassign claims'
      });
    }
  };

  // Handle single-claim reassignment
  const handleSingleReassign = async (reassignmentData) => {
    try {
      const reassignAction = reassignmentModal.type === 'FORCE' ? forceReassign : standardReassign;

      await dispatch(reassignAction({
        claimId: reassignmentModal.claimId,
        toEditorId: reassignmentData.toEditorId,
        fromEditorId: reassignmentModal.currentEditor?.id,
        type: reassignmentModal.type,
        reason: reassignmentData.reason
      })).unwrap();

      // Show success notification
      setNotification({
        type: 'success',
        message: `Successfully reassigned claim`
      });

      // Close modal and refresh data
      dispatch(closeReassignmentModal());
      fetchClaims();
    } catch (error) {
      // Show error notification
      setNotification({
        type: 'error',
        message: error || 'Failed to reassign claim'
      });
    }
  };

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      const claimIds = claimsData.map(claim => claim.id);
      dispatch(selectAllClaims(claimIds));
    } else {
      dispatch(clearBulkSelection());
    }
  };

  // Check if all claims on current page are selected
  const areAllSelected = claimsData.length > 0 &&
    claimsData.every(claim => selectedClaims.includes(claim.id));

  // Create columns with checkbox column prepended
  const columnsWithCheckbox = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={areAllSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
          aria-label="Select all claims"
        />
      ),
      sortable: false,
      render: (_value, row) => (
        <input
          type="checkbox"
          checked={selectedClaims.includes(row.id)}
          onChange={() => dispatch(toggleBulkSelection(row.id))}
          className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
          aria-label={`Select claim ${row.id}`}
        />
      ),
    },
    ...editManagementColumns,
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader title="Edit Management" />

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            label="Total Claims"
            value={stats.totalClaims}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconColor="text-gray-500"
            onClick={() => navigate('/dashboard/analytics')}
          />
          <StatsCard
            label="Edit Done"
            value={stats.editDone}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="text-green-500"
            onClick={() => navigate('/dashboard/analytics?filter=done')}
          />
          <StatsCard
            label="Edit Pending"
            value={stats.editPending}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="text-yellow-500"
            onClick={() => navigate('/dashboard/analytics?filter=pending')}
          />
        </div>

        {/* Search Bar with Export and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Search Visit Number and Claim ID, for more search use Filters option"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/*<button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">*/}
          {/*  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
          {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />*/}
          {/*  </svg>*/}
          {/*  <span className="text-sm font-medium">Export</span>*/}
          {/*</button>*/}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Filter Section */}
        {showFilters && <EditFilters filters={filters} onFilterChange={setFilters} />}

        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border animate-fade-in ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
            role="alert"
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-gray-400 hover:text-gray-600"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Data Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Bulk Action Toolbar */}
          {selectedClaims.length > 0 && (
            <div className="bg-primary-50 border-b border-primary-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-primary-900">
                    {selectedClaims.length} claim{selectedClaims.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBulkReassignModal(true)}
                    disabled={isReassigning}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isReassigning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Bulk Reassign</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => dispatch(clearBulkSelection())}
                    disabled={isReassigning}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={columnsWithCheckbox}
            data={claimsData}
            rowsPerPage={pageSize}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Bulk Reassignment Modal */}
      {showBulkReassignModal && (
        <ReassignmentModal
          isOpen={showBulkReassignModal}
          onClose={() => setShowBulkReassignModal(false)}
          claim={{
            id: selectedClaims.length > 1 ? 'Multiple Claims' : selectedClaims[0],
            patientName: 'Multiple Claims',
            assignedTo: null,
            assignedToName: 'Various',
            editStatus: 'Bulk Operation'
          }}
          type="STANDARD"
          onReassign={handleBulkReassign}
          isBulk={true}
          selectedCount={selectedClaims.length}
        />
      )}

      {/* Single-Claim Reassignment Modal (from ClaimActionMenu) */}
      {reassignmentModal.isOpen && (
        <ReassignmentModal
          isOpen={reassignmentModal.isOpen}
          onClose={() => dispatch(closeReassignmentModal())}
          claim={claimsData.find(c => c.id === reassignmentModal.claimId) || {
            id: reassignmentModal.claimId,
            patientName: 'Unknown',
            assignedTo: reassignmentModal.currentEditor,
            assignedToName: 'Unknown',
            editStatus: 'Unknown'
          }}
          type={reassignmentModal.type}
          onReassign={handleSingleReassign}
          isBulk={false}
        />
      )}
    </div>
  );
};

export default EditManagement;
