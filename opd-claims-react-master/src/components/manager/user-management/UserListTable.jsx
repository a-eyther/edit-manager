import { MoreVertical, UserCheck, UserX, KeyRound, FileText } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../common/DataTable';
import StatusBadge from '../../common/StatusBadge';
import UserAuditModal from '../../common/UserAuditModal';
import { UserStatus } from '../../../types/api-contracts';

/**
 * User List Table Component
 *
 * Displays users in a data table with action buttons.
 * Supports activation, deactivation, and password reset actions.
 *
 * @param {Object} props
 * @param {Array} props.users - Array of user objects
 * @param {Function} props.onActivate - Callback when user is activated
 * @param {Function} props.onDeactivate - Callback when user is deactivated
 * @param {Function} props.onResetPassword - Callback when password reset is triggered
 * @param {boolean} props.loading - Loading state
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change callback
 * @param {number} props.rowsPerPage - Rows per page
 * @param {Function} props.onPageSizeChange - Page size change callback
 * @returns {JSX.Element}
 */
const UserListTable = ({
  users,
  onActivate,
  onDeactivate,
  onResetPassword,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onPageSizeChange
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedUserForAudit, setSelectedUserForAudit] = useState(null);

  const handleMenuToggle = (userId) => {
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  const handleAction = (action, user) => {
    setOpenMenuId(null);
    action(user);
  };

  const handleViewAudit = (user) => {
    setOpenMenuId(null);
    setSelectedUserForAudit(user);
    setAuditModalOpen(true);
  };

  // Action Menu Component
  const ActionMenu = ({ user }) => {
    const isActive = user.status === UserStatus.ACTIVE;

    return (
      <div className="relative">
        <button
          onClick={() => handleMenuToggle(user.id)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="User actions"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>

        {openMenuId === user.id && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpenMenuId(null)}
            ></div>

            {/* Menu */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
              <button
                onClick={() => handleViewAudit(user)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Audit Trail</span>
              </button>
              {isActive ? (
                <>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    onClick={() => handleAction(() => onResetPassword(user.id), user)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Reset Password</span>
                  </button>
                  <button
                    onClick={() => handleAction(onDeactivate, user)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Deactivate</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    onClick={() => handleAction(() => onActivate(user.id), user)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Activate</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (value, user) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${value === 'MANAGER'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700'
          }
        `}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'claimsAssigned',
      header: 'Current Load',
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{value || 0}</span>
          <span className="text-xs text-gray-500">claims</span>
        </div>
      )
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (value) => {
        if (!value) return <span className="text-gray-400 text-sm">Never</span>;
        const date = new Date(value);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

        let display;
        if (diffHours < 1) {
          display = 'Just now';
        } else if (diffHours < 24) {
          display = `${diffHours}h ago`;
        } else if (diffHours < 48) {
          display = 'Yesterday';
        } else {
          display = date.toLocaleDateString();
        }

        return (
          <span className="text-sm text-gray-600" title={date.toLocaleString()}>
            {display}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, user) => <ActionMenu user={user} />
    }
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onPageSizeChange={onPageSizeChange}
      />

      {/* User Audit Modal */}
      <UserAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        user={selectedUserForAudit}
      />
    </>
  );
};

export default UserListTable;
