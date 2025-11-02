import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Mail, User, Shield, CheckCircle, Copy, Check } from 'lucide-react';
import {
  createUser,
  selectIsLoading,
  selectError,
  selectLastCreatedUser,
  fetchUsers
} from '../../../store/slices/usersSlice';
import { UserRole } from '../../../types/api-contracts';

/**
 * Create User Modal Component
 *
 * Modal for creating new users (editors or managers).
 * Shows temporary password after successful creation.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close modal callback
 * @returns {JSX.Element}
 */
const CreateUserModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const lastCreatedUser = useSelector(selectLastCreatedUser);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: UserRole.EDITOR
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: '', name: '', role: UserRole.EDITOR });
      setValidationErrors({});
      setShowSuccess(false);
      setCopiedPassword(false);
      onClose();
    }
  };

  const validateForm = () => {
    const errors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(createUser(formData)).unwrap();
      setShowSuccess(true);
      // Refresh user list
      dispatch(fetchUsers());
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleCopyPassword = () => {
    if (lastCreatedUser?.temporaryPassword) {
      navigator.clipboard.writeText(lastCreatedUser.temporaryPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleDone = () => {
    handleClose();
  };

  if (!isOpen) return null;

  // Success State
  if (showSuccess && lastCreatedUser) {
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
                User Created Successfully!
              </h3>
              <p className="text-sm text-gray-600">
                {lastCreatedUser.user.name} has been added to the system.
              </p>
            </div>

            {/* User Details */}
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Name</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{lastCreatedUser.user.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{lastCreatedUser.user.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Role</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{lastCreatedUser.user.role}</p>
                </div>
              </div>

              {/* Temporary Password */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="text-xs text-blue-700 uppercase tracking-wider font-semibold">
                  Temporary Password
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm font-mono text-gray-900">
                    {lastCreatedUser.temporaryPassword}
                  </code>
                  <button
                    onClick={handleCopyPassword}
                    className="px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                    title="Copy password"
                  >
                    {copiedPassword ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-blue-700">
                  Share this password securely with the user. They will be prompted to change it on first login.
                </p>
              </div>

              {lastCreatedUser.welcomeEmailSent && (
                <p className="mt-3 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Welcome email sent successfully
                </p>
              )}
            </div>

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

  // Form State
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                  disabled={isLoading}
                  required
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             ${validationErrors.name ? 'border-red-300' : 'border-gray-300'}`}
                  disabled={isLoading}
                  required
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={isLoading}
                  required
                >
                  <option value={UserRole.EDITOR}>Editor</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Editors can process and adjudicate claims. Manager accounts are managed separately.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
                         rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                         bg-primary-500 rounded-md hover:bg-primary-600 transition-colors
                         disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
