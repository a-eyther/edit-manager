import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  fetchActiveEditors,
  selectActiveEditors,
  selectIsEditorsLoading
} from '../../../store/slices/editManagerSlice';
import ForceReassignWarning from './ForceReassignWarning';

/**
 * Reassignment Modal Component
 *
 * Modal for reassigning a claim to a different editor.
 * Supports both standard and force reassignment workflows, as well as bulk operations.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close modal callback
 * @param {Object} props.claim - Claim object to reassign
 * @param {string} props.type - Reassignment type ('STANDARD' | 'FORCE')
 * @param {Function} props.onReassign - Callback when reassignment is confirmed
 * @param {boolean} props.isBulk - Whether this is a bulk reassignment
 * @param {number} props.selectedCount - Number of claims selected for bulk operation
 * @returns {JSX.Element}
 */
const ReassignmentModal = ({ isOpen, onClose, claim, type, onReassign, isBulk = false, selectedCount = 0 }) => {
  const dispatch = useDispatch();
  const editors = useSelector(selectActiveEditors);
  const isLoading = useSelector(selectIsEditorsLoading);

  const [selectedEditor, setSelectedEditor] = useState(null);
  const [reason, setReason] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isForceReassignment = type === 'FORCE';

  // Fetch editors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchActiveEditors());
      setSelectedEditor(null);
      setReason('');
      setShowWarning(false);
      setIsSubmitting(false);
    }
  }, [isOpen, dispatch]);

  // Filter out current assignee from editor list
  const availableEditors = editors.filter(
    editor => editor.id !== claim?.assignedTo
  );

  const handleProceed = () => {
    if (!selectedEditor) return;

    if (isForceReassignment) {
      setShowWarning(true);
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    if (!selectedEditor || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const editor = editors.find(e => e.id === selectedEditor);
      await onReassign({
        claimId: claim.id,
        fromEditorId: claim.assignedTo,
        toEditorId: selectedEditor,
        toEditorName: editor.name,
        type,
        reason: reason.trim() || undefined
      });
      onClose();
    } catch (error) {
      console.error('Reassignment failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !showWarning) {
      onClose();
    }
  };

  if (!isOpen || !claim) return null;

  // Show force reassignment warning
  if (showWarning) {
    return (
      <ForceReassignWarning
        claimId={claim.id}
        currentEditor={claim.assignedToName}
        newEditor={editors.find(e => e.id === selectedEditor)?.name}
        onConfirm={handleConfirm}
        onCancel={() => setShowWarning(false)}
      />
    );
  }

  const isReasonRequired = false; // Reason is optional for all reassignment types
  const canProceed = selectedEditor && (!isReasonRequired || reason.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="reassignment-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-lg w-full animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`
            flex items-center justify-between px-6 py-4 border-b rounded-t-lg
            ${isForceReassignment ? 'bg-orange-50 border-orange-200' : isBulk ? 'bg-primary-600 border-primary-700' : 'border-gray-200 bg-white'}
          `}>
            <div className="flex items-center gap-3">
              {isForceReassignment && <AlertTriangle className="w-5 h-5 text-orange-600" />}
              {isBulk && !isForceReassignment && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
              <h3
                id="reassignment-modal-title"
                className={`text-lg font-semibold ${isForceReassignment ? 'text-orange-900' : isBulk ? 'text-white' : 'text-gray-900'}`}
              >
                {isBulk ? `Bulk Reassign (${selectedCount} Claims)` : isForceReassignment ? 'Force Reassign Claim' : 'Reassign Claim'}
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className={`transition-colors disabled:opacity-50 ${isBulk ? 'text-primary-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Warning Banner (Force Reassignment) */}
          {isForceReassignment && (
            <div className="px-6 py-3 bg-orange-50 border-b border-orange-200">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900 mb-1">
                    This claim is currently being processed
                  </p>
                  <p className="text-orange-700">
                    Force reassignment will remove the claim from <span className="font-semibold">{claim.assignedToName}</span>'s
                    active queue. A reason is required.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Claim Info or Bulk Info */}
            {isBulk ? (
              <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-primary-900 mb-1">
                      Bulk Reassignment
                    </p>
                    <p className="text-primary-700">
                      You are about to reassign <span className="font-semibold">{selectedCount} claim{selectedCount !== 1 ? 's' : ''}</span> to a new editor.
                      This action will update the assignment for all selected claims.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Claim ID:</span>
                    <span className="ml-2 font-semibold text-gray-900">{claim.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Patient:</span>
                    <span className="ml-2 font-semibold text-gray-900">{claim.patientName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Editor:</span>
                    <span className="ml-2 font-semibold text-gray-900">{claim.assignedToName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-semibold text-gray-900">{claim.editStatus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Select New Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Editor <span className="text-red-500">*</span>
              </label>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-sm text-gray-600">Loading editors...</span>
                </div>
              ) : availableEditors.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  No other active editors available
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableEditors.map((editor) => (
                    <label
                      key={editor.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
                        transition-all duration-200
                        ${selectedEditor === editor.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="editor"
                          value={editor.id}
                          checked={selectedEditor === editor.id}
                          onChange={() => setSelectedEditor(editor.id)}
                          className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{editor.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{editor.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-gray-200">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                          {editor.claimsAssigned || 0} in queue
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Reason (Optional for all reassignment types) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-gray-500 text-xs ml-1">(Optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isForceReassignment
                    ? 'Explain why this claim needs to be force reassigned...'
                    : isBulk
                    ? 'Optional reason for bulk reassignment...'
                    : 'Optional reason for reassignment...'
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           placeholder:text-gray-400"
                required={false}
              />
              <p className="mt-1 text-xs text-gray-500">
                Adding a reason helps track reassignment history
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
                         rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!canProceed || isSubmitting || isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md
                transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed
                ${isForceReassignment
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-primary-600 hover:bg-primary-700'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isBulk
                      ? `Reassign ${selectedCount} Claim${selectedCount !== 1 ? 's' : ''}`
                      : isForceReassignment
                      ? 'Force Reassign'
                      : 'Reassign Claim'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReassignmentModal;
