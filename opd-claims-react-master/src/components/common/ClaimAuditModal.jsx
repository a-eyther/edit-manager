import { X, FileText } from 'lucide-react';
import AuditTable from './AuditTable';

/**
 * Claim Audit Modal Component
 *
 * Displays audit trail for a specific claim.
 * Shows all actions and status changes related to the claim.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.claim - Claim data
 * @param {Array} props.auditEntries - Audit entries for this claim (optional, placeholder for now)
 * @returns {JSX.Element|null}
 */
const ClaimAuditModal = ({ isOpen, onClose, claim, auditEntries }) => {
  if (!isOpen) return null;

  // Placeholder: In production, this would fetch from API
  // For now, show mock data or placeholder message
  const hasRealData = auditEntries && auditEntries.length > 0;

  // Mock audit entries for demonstration
  const mockEntries = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      eventType: 'CLAIM_ADJUDICATED',
      performedByName: 'Jane Editor',
      claimId: claim?.claim_unique_id || claim?.id,
      userName: null,
      details: {
        claimId: claim?.id,
        decision: 'APPROVED',
        approvedAmount: 15000
      },
      changes: {
        status: { from: 'IN_PROGRESS', to: 'ADJUDICATED' },
        decision: { from: null, to: 'APPROVED' }
      }
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      eventType: 'CLAIM_ASSIGNED',
      performedByName: 'Manager User',
      claimId: claim?.claim_unique_id || claim?.id,
      userName: 'Jane Editor',
      details: {
        claimId: claim?.id,
        assignedTo: 'Jane Editor',
        assignedBy: 'Manager User'
      },
      changes: {
        assignedTo: { from: null, to: 'Jane Editor' },
        status: { from: 'PENDING', to: 'ASSIGNED' }
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
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Claim Audit Trail
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Claim ID: {claim?.claim_unique_id || claim?.id || 'N/A'}
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
                    In production, this will display the complete audit trail for this claim,
                    including assignments, edits, status changes, and approvals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {claim && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Claim Details:</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Claim ID:</dt>
                  <dd className="text-gray-900 font-medium">{claim.claim_unique_id || claim.id}</dd>
                </div>
                {claim.visit_number && (
                  <div>
                    <dt className="text-gray-500">Visit Number:</dt>
                    <dd className="text-gray-900 font-medium">{claim.visit_number}</dd>
                  </div>
                )}
                {claim.edit_status && (
                  <div>
                    <dt className="text-gray-500">Status:</dt>
                    <dd className="text-gray-900 font-medium">{claim.edit_status}</dd>
                  </div>
                )}
                {claim.benefit_name && (
                  <div>
                    <dt className="text-gray-500">Benefit:</dt>
                    <dd className="text-gray-900 font-medium">{claim.benefit_name}</dd>
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
            hideClaimColumn={true}
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

export default ClaimAuditModal;
