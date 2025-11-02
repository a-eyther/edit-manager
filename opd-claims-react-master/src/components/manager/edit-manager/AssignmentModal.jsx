import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, User, Clock, CheckCircle } from 'lucide-react';
import {
  fetchActiveEditors,
  selectActiveEditors,
  selectIsEditorsLoading
} from '../../../store/slices/editManagerSlice';

/**
 * Assignment Modal Component
 *
 * Modal for assigning a claim to an editor after re-adjudication.
 * Shows list of active editors with their current queue counts.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close modal callback
 * @param {string} props.claimId - Claim ID to assign
 * @param {Function} props.onAssign - Callback when editor is assigned (editorId, editorName)
 * @returns {JSX.Element}
 */
const AssignmentModal = ({ isOpen, onClose, claimId, onAssign }) => {
  const dispatch = useDispatch();
  const editors = useSelector(selectActiveEditors);
  const isLoading = useSelector(selectIsEditorsLoading);

  const [selectedEditor, setSelectedEditor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch editors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchActiveEditors());
      setSelectedEditor(null);
      setIsSubmitting(false);
    }
  }, [isOpen, dispatch]);

  const handleAssign = async () => {
    if (!selectedEditor || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const editor = editors.find(e => e.id === selectedEditor);
      await onAssign(selectedEditor, editor.name);
      onClose();
    } catch (error) {
      console.error('Assignment failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="assignment-modal-title"
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
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3
              id="assignment-modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              Assign Claim to Editor
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              Select an editor to assign claim <span className="font-semibold">{claimId}</span> for re-adjudication.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading editors...</span>
              </div>
            ) : editors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active editors available
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {editors.map((editor) => (
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
              onClick={handleAssign}
              disabled={!selectedEditor || isSubmitting || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                         bg-primary-500 rounded-md hover:bg-primary-600 transition-colors
                         disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Assign Claim</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
