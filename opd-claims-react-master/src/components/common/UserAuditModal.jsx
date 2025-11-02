import { X, User, FileText } from 'lucide-react';
import AuditTable from './AuditTable';

/**
 * User Audit Modal Component
 *
 * Displays audit trail for a specific user.
 * Shows all actions performed by or related to the user.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.user - User data
 * @param {Array} props.auditEntries - Audit entries for this user (optional, placeholder for now)
 * @returns {JSX.Element|null}
 */
const UserAuditModal = ({ isOpen, onClose, user, auditEntries }) => {
  if (!isOpen) return null;

  // Placeholder: In production, this would fetch from API
  // For now, show mock data or placeholder message
  const hasRealData = auditEntries && auditEntries.length > 0;

  // Mock audit entries for demonstration
  const mockEntries = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      eventType: 'USER_ACTIVATED',
      performedByName: 'Admin User',
      claimId: null,
      userName: user?.name || user?.full_name,
      details: {
        userId: user?.id,
        action: 'User account activated',
        performedBy: 1
      },
      changes: {
        status: { from: 'inactive', to: 'active' }
      }
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      eventType: 'USER_CREATED',
      performedByName: 'System Admin',
      claimId: null,
      userName: user?.name || user?.full_name,
      details: {
        userId: user?.id,
        email: user?.email,
        role: user?.role
      }
    }
  ];

  const displayEntries = hasRealData ? auditEntries : mockEntries;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                User Audit Trail
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {user?.name || user?.full_name || 'Unknown User'} - {user?.email || 'No email'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasRealData && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Showing sample audit data</p>
                  <p className="text-blue-700">
                    In production, this will display the complete audit trail for this user,
                    including all actions they performed and changes made to their account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">User Details:</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">User ID:</dt>
                  <dd className="text-gray-900 font-medium">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email:</dt>
                  <dd className="text-gray-900 font-medium">{user.email}</dd>
                </div>
                {user.role && (
                  <div>
                    <dt className="text-gray-500">Role:</dt>
                    <dd className="text-gray-900 font-medium">{user.role}</dd>
                  </div>
                )}
                {user.status && (
                  <div>
                    <dt className="text-gray-500">Status:</dt>
                    <dd className="text-gray-900 font-medium">{user.status}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Audit History ({displayEntries.length} {displayEntries.length === 1 ? 'entry' : 'entries'})
            </h3>
          </div>

          <AuditTable
            entries={displayEntries}
            hideUserColumn={true}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAuditModal;
