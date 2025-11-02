import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, User } from 'lucide-react';
import { fetchActiveEditors, selectActiveEditors, selectIsEditorsLoading } from '../../store/slices/editManagerSlice';

/**
 * Assign To Modal Component
 *
 * Modal for assigning a single claim to an editor.
 * Similar to bulk reassignment but for one claim only.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.claim - Claim to be assigned
 * @param {Function} props.onAssign - Callback when assignment is confirmed (optional)
 * @returns {JSX.Element|null}
 */
const AssignToModal = ({ isOpen, onClose, claim, onAssign }) => {
  const dispatch = useDispatch();
  const editors = useSelector(selectActiveEditors);
  const isLoadingEditors = useSelector(selectIsEditorsLoading);

  const [selectedEditor, setSelectedEditor] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch editors when modal opens
  useEffect(() => {
    if (isOpen && editors.length === 0) {
      dispatch(fetchActiveEditors());
    }
  }, [isOpen, editors.length, dispatch]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedEditor('');
      setReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!selectedEditor) {
      alert('Please select an editor');
      return;
    }

    setIsSubmitting(true);

    try {
      // Frontend-only: In production, this would call an API
      // For now, just show a success message
      const selectedEditorData = editors.find(e => e.id === parseInt(selectedEditor));

      console.log('Assigning claim:', {
        claimId: claim?.claim_unique_id || claim?.id,
        editorId: selectedEditor,
        editorName: selectedEditorData?.name,
        reason
      });

      // Call the optional onAssign callback if provided
      if (onAssign) {
        await onAssign({
          claimId: claim?.id,
          editorId: selectedEditor,
          reason
        });
      }

      alert(`Claim ${claim?.claim_unique_id || claim?.id} assigned to ${selectedEditorData?.name} successfully!`);
      onClose();
    } catch (error) {
      console.error('Failed to assign claim:', error);
      alert('Failed to assign claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Assign Claim
              </h2>
              <p className="text-sm text-gray-500">
                {claim?.claim_unique_id || claim?.id || 'Unknown Claim'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Editor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEditor}
              onChange={(e) => setSelectedEditor(e.target.value)}
              disabled={isLoadingEditors || isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select an editor...</option>
              {editors.map(editor => (
                <option key={editor.id} value={editor.id}>
                  {editor.name} - {editor.email}
                </option>
              ))}
            </select>
            {isLoadingEditors && (
              <p className="text-xs text-gray-500 mt-1">Loading editors...</p>
            )}
          </div>

          {/* Optional Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="Enter reason for assignment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Claim Info */}
          {claim && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Claim Details:</h4>
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Claim ID:</dt>
                  <dd className="text-gray-900 font-medium">{claim.claim_unique_id || claim.id}</dd>
                </div>
                {claim.visit_number && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Visit Number:</dt>
                    <dd className="text-gray-900 font-medium">{claim.visit_number}</dd>
                  </div>
                )}
                {claim.benefit_name && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Benefit:</dt>
                    <dd className="text-gray-900 font-medium">{claim.benefit_name}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedEditor || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Assigning...' : 'Assign Claim'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignToModal;
