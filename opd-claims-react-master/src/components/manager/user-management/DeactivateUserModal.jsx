import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, AlertTriangle, UserX, CheckCircle, ArrowRight } from 'lucide-react';
import {
  deactivateUser,
  selectIsLoading,
  selectError,
  selectLastDeactivationResult,
  fetchUsers
} from '../../../store/slices/usersSlice';

/**
 * Deactivate User Modal Component
 *
 * Modal for deactivating a user account.
 * Shows warning about claim redistribution and requires confirmation.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close modal callback
 * @param {Object} props.user - User object to deactivate
 * @returns {JSX.Element}
 */
const DeactivateUserModal = ({ isOpen, onClose, user }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const lastDeactivationResult = useSelector(selectLastDeactivationResult);

  const [confirmed, setConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    if (!isLoading) {
      setConfirmed(false);
      setShowSuccess(false);
      onClose();
    }
  };

  const handleDeactivate = async () => {
    if (!confirmed || !user || isLoading) return;

    try {
      await dispatch(deactivateUser(user.id)).unwrap();
      setShowSuccess(true);
      // Refresh user list
      dispatch(fetchUsers());
    } catch (error) {
      console.error('Failed to deactivate user:', error);
    }
  };

  const handleDone = () => {
    handleClose();
  };

  if (!isOpen || !user) return null;

  // Success State
  if (showSuccess && lastDeactivationResult) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
            {/* Success Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                User Deactivated Successfully
              </h3>
              <p className="text-sm text-gray-600">
                {lastDeactivationResult.user.name} has been deactivated.
              </p>
            </div>

            {/* Redistribution Summary */}
            {lastDeactivationResult.claimsRedistributed > 0 && (
              <div className="px-6 pb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-900">
                      Claims Redistributed
                    </h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    {lastDeactivationResult.claimsRedistributed} claim(s) were automatically reassigned to other active editors:
                  </p>
                  <div className="space-y-2">
                    {lastDeactivationResult.redistributionDetails?.map((detail, index) => (
                      <div key={index} className="bg-white rounded p-2 text-xs">
                        <span className="font-semibold text-gray-900">{detail.claimId}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-700">{detail.newAssigneeName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {lastDeactivationResult.claimsRedistributed === 0 && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 text-center">
                  No claims were assigned to this user.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleDone}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-500
                           rounded-md hover:bg-primary-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation State
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="alertdialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50">
            <div className="flex items-center gap-3">
              <UserX className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">
                Deactivate User
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 mb-1">
                    This action will have the following effects:
                  </p>
                  <ul className="space-y-1 text-yellow-700 list-disc list-inside">
                    <li>User will no longer be able to access the system</li>
                    <li>All assigned claims will be automatically redistributed</li>
                    <li>User can be reactivated later if needed</li>
                    <li>User data and history will be preserved</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">User Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium text-gray-900">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Claims Assigned:</span>
                  <span className="font-medium text-gray-900">{user.claimsAssigned || 0}</span>
                </div>
              </div>
            </div>

            {/* Claims Redistribution Info */}
            {user.claimsAssigned > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      Claim Redistribution
                    </p>
                    <p className="text-blue-700">
                      {user.claimsAssigned} claim(s) will be automatically redistributed to other active editors
                      with the lowest current workload. All editors will be notified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-red-600 focus:ring-2 focus:ring-red-500"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">
                I understand that this will deactivate <span className="font-semibold">{user.name}</span> and
                redistribute all their assigned claims.
              </span>
            </label>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
                         rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeactivate}
              disabled={!confirmed || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                         bg-red-600 rounded-md hover:bg-red-700 transition-colors
                         disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4" />
                  <span>Deactivate User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateUserModal;
