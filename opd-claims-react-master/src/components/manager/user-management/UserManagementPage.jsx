import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, X } from 'lucide-react';
import {
  fetchUsers,
  selectUsers,
  selectPagination,
  selectFilters,
  selectIsLoading,
  selectError,
  selectIsCreateModalOpen,
  selectIsDeactivateModalOpen,
  selectSelectedUser,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  openModal,
  closeModal,
  setSelectedUser,
  activateUser,
  resetPassword
} from '../../../store/slices/usersSlice';
import { addNotification } from '../../../store/slices/notificationsSlice';
import PageHeader from '../../common/PageHeader';
import UserListTable from './UserListTable';
import CreateUserModal from './CreateUserModal';
import DeactivateUserModal from './DeactivateUserModal';
import ConfirmationModal from '../../common/ConfirmationModal';
import { UserRole, UserStatus, NotificationType } from '../../../types/api-contracts';

/**
 * User Management Page Component
 *
 * Full page component for managing users (editors and managers).
 * Includes filtering, user creation, activation/deactivation, and password reset.
 *
 * @returns {JSX.Element}
 */
const UserManagementPage = () => {
  const dispatch = useDispatch();

  // Redux state
  const users = useSelector(selectUsers);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isCreateModalOpen = useSelector(selectIsCreateModalOpen);
  const isDeactivateModalOpen = useSelector(selectIsDeactivateModalOpen);
  const selectedUser = useSelector(selectSelectedUser);

  // Local state for filter UI
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // Local state for confirmation modal
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch users on mount and when filters change
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchInput('');
    setShowFilters(false);
  };

  const handleCreateUser = () => {
    dispatch(openModal('createUser'));
  };

  const handleDeactivate = (user) => {
    dispatch(setSelectedUser(user));
    dispatch(openModal('deactivateUser'));
  };

  const handleActivate = async (userId) => {
    try {
      await dispatch(activateUser(userId)).unwrap();
      // Refresh user list
      dispatch(fetchUsers());
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const handleResetPassword = (userId) => {
    setUserToReset(userId);
    setShowResetConfirmation(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!userToReset) return;

    setIsResetting(true);
    try {
      const result = await dispatch(resetPassword(userToReset)).unwrap();

      // Show success notification
      dispatch(addNotification({
        type: NotificationType.PASSWORD_RESET,
        title: 'Password Reset Successful',
        message: 'Password reset email sent successfully! The user will receive instructions to reset their password.',
        userId: userToReset
      }));

      console.log('Reset token (mock):', result.resetToken);

      // Refresh user list
      dispatch(fetchUsers());
    } catch (error) {
      console.error('Failed to reset password:', error);

      // Show error notification
      dispatch(addNotification({
        type: NotificationType.SYSTEM_ALERT,
        title: 'Password Reset Failed',
        message: error.message || 'Failed to reset password. Please try again.',
        userId: userToReset
      }));
    } finally {
      setIsResetting(false);
      setShowResetConfirmation(false);
      setUserToReset(null);
    }
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  const handlePageSizeChange = (limit) => {
    dispatch(setLimit(limit));
  };

  const hasActiveFilters = filters.status || filters.search;

  return (
    <div>
      {/* Page Header */}
      <PageHeader title="User Management" />

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Subtitle */}
        <p className="text-sm text-gray-600">
          Manage editor accounts, claim assignments, and user permissions. Control access and monitor editor activity.
        </p>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
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
                className={`
                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                  transition-colors border
                  ${hasActiveFilters || showFilters
                    ? 'bg-primary-50 text-primary-700 border-primary-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                    {[filters.status, filters.search].filter(Boolean).length}
                  </span>
                )}
              </button>

              <button
                onClick={handleCreateUser}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                           bg-primary-500 rounded-md hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Statuses</option>
                    <option value={UserStatus.ACTIVE}>Active</option>
                    <option value={UserStatus.INACTIVE}>Inactive</option>
                  </select>
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
            <div className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* User Table */}
        <UserListTable
          users={users}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onResetPassword={handleResetPassword}
          loading={isLoading}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.limit}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Modals */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => dispatch(closeModal('createUser'))}
        />

        <DeactivateUserModal
          isOpen={isDeactivateModalOpen}
          onClose={() => dispatch(closeModal('deactivateUser'))}
          user={selectedUser}
        />

        {/* Password Reset Confirmation Modal */}
        <ConfirmationModal
          isOpen={showResetConfirmation}
          onClose={() => {
            if (!isResetting) {
              setShowResetConfirmation(false);
              setUserToReset(null);
            }
          }}
          onConfirm={handleConfirmResetPassword}
          title="Reset Password"
          message="Are you sure you want to reset this user's password? A password reset email will be sent to the user with instructions."
          confirmText="Reset Password"
          cancelText="Cancel"
          variant="warning"
          isLoading={isResetting}
        />
      </div>
    </div>
  );
};

export default UserManagementPage;
