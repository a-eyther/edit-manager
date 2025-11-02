import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

/**
 * Force Reassign Warning Component
 *
 * Double confirmation dialog for force reassignment.
 * Shows impact details and requires explicit confirmation.
 *
 * @param {Object} props
 * @param {string} props.claimId - Claim ID being reassigned
 * @param {string} props.currentEditor - Current editor name
 * @param {string} props.newEditor - New editor name
 * @param {Function} props.onConfirm - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 * @returns {JSX.Element}
 */
const ForceReassignWarning = ({
  claimId,
  currentEditor,
  newEditor,
  onConfirm,
  onCancel
}) => {
  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto"
      aria-labelledby="force-reassign-warning-title"
      role="alertdialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full animate-fade-in">
          {/* Header with Icon */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3
                  id="force-reassign-warning-title"
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  Confirm Force Reassignment
                </h3>
                <p className="text-sm text-gray-600">
                  This action will interrupt the current editor's work and reassign the claim immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Impact Details */}
          <div className="px-6 pb-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-orange-900 mb-3">
                Impact of this action:
              </h4>
              <ul className="space-y-2 text-sm text-orange-800">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></div>
                  <span>
                    Claim <span className="font-semibold">{claimId}</span> will be removed from{' '}
                    <span className="font-semibold">{currentEditor}</span>'s active queue
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></div>
                  <span>
                    Any in-progress work by {currentEditor} will be lost
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></div>
                  <span>
                    Claim will be assigned to <span className="font-semibold">{newEditor}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></div>
                  <span>
                    Both editors will receive notifications about this change
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></div>
                  <span>
                    This action will be logged in the audit trail
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Confirmation Question */}
          <div className="px-6 pb-4">
            <p className="text-sm font-medium text-gray-900">
              Are you sure you want to proceed with force reassignment?
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
                         bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                         bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Yes, Force Reassign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForceReassignWarning;
