import { useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

/**
 * Confirmation Modal Component
 *
 * Reusable confirmation dialog with customizable actions and variants.
 * Replaces window.confirm() with a properly styled modal that matches the design system.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal is closed/cancelled
 * @param {Function} props.onConfirm - Callback when user confirms action
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {string} [props.confirmText='Confirm'] - Text for confirm button
 * @param {string} [props.cancelText='Cancel'] - Text for cancel button
 * @param {('default'|'danger'|'warning')} [props.variant='default'] - Visual variant
 * @param {boolean} [props.isLoading=false] - Loading state for confirm button
 * @returns {JSX.Element|null}
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, isLoading, onClose]);

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Variant-specific styling
  const variantConfig = {
    default: {
      icon: CheckCircle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmButton: 'bg-primary-600 hover:bg-primary-700 text-white'
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      confirmButton: 'bg-orange-600 hover:bg-orange-700 text-white'
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full animate-slide-in">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="confirmation-modal-title"
                className="text-lg font-semibold text-gray-900 mb-2"
              >
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
            {/* Close button */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
                       rounded-md hover:bg-gray-50 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${config.confirmButton}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
