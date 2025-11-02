/**
 * User Management API Service
 *
 * Real backend API calls for user management features (F3: User Management).
 * When backend is ready, implement these functions to call actual endpoints.
 *
 * @module services/api/userManagementAPI
 */

import axios from '../../utils/axios';

/**
 * Get all users (editors and managers)
 *
 * @param {object} params - Query parameters
 * @param {string} [params.role] - Filter by role (EDITOR | MANAGER)
 * @param {string} [params.status] - Filter by status (ACTIVE | INACTIVE)
 * @param {string} [params.search] - Search by name or email
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=25] - Items per page
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').PaginatedResponse<import('../../types/api-contracts').User>>>}
 */
export const getUsers = async (params = {}) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/users?role=...&status=...&search=...&page=...&limit=...
    // Expected response: { success: true, data: { data: [...users], pagination: {...} } }

    const response = await axios.get('/api/users', { params });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get single user by ID
 *
 * @param {string} userId
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').User>>}
 */
export const getUserById = async (userId) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/users/:userId
    // Expected response: { success: true, data: {...user} }

    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw {
      success: false,
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Create a new user
 *
 * @param {import('../../types/api-contracts').CreateUserRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').CreateUserResponse>>}
 *
 * @example
 * const response = await createUser({
 *   email: 'john.doe@example.com',
 *   name: 'John Doe',
 *   role: 'EDITOR'
 * });
 */
export const createUser = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/users
    // Expected request body: { email, name, role }
    // Expected response: { success: true, data: { user, temporaryPassword, welcomeEmailSent } }

    const response = await axios.post('/api/users', request);
    return response.data;
  } catch (error) {
    throw {
      success: false,
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Activate a user
 *
 * @param {import('../../types/api-contracts').ActivateUserRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').User>>}
 *
 * @example
 * const response = await activateUser({
 *   userId: 'EDR-2001'
 * });
 */
export const activateUser = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/users/:userId/activate
    // Expected request body: { userId }
    // Expected response: { success: true, data: {...user} }

    const response = await axios.post(`/api/users/${request.userId}/activate`, request);
    return response.data;
  } catch (error) {
    throw {
      success: false,
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Deactivate a user
 *
 * @param {import('../../types/api-contracts').DeactivateUserRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').DeactivateUserResponse>>}
 *
 * @example
 * const response = await deactivateUser({
 *   userId: 'EDR-2001'
 * });
 */
export const deactivateUser = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/users/:userId/deactivate
    // Expected request body: { userId }
    // Expected response: { success: true, data: { user, claimsRedistributed, redistributionDetails: [...] } }

    const response = await axios.post(`/api/users/${request.userId}/deactivate`, request);
    return response.data;
  } catch (error) {
    throw {
      success: false,
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Reset user password
 *
 * @param {import('../../types/api-contracts').ResetPasswordRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').ResetPasswordResponse>>}
 *
 * @example
 * const response = await resetPassword({
 *   userId: 'EDR-2001'
 * });
 */
export const resetPassword = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/users/:userId/reset-password
    // Expected request body: { userId }
    // Expected response: { success: true, data: { emailSent, expiresAt } }
    // Note: resetToken should NOT be returned in production API (only in mock)

    const response = await axios.post(`/api/users/${request.userId}/reset-password`, request);
    return response.data;
  } catch (error) {
    throw {
      success: false,
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Update user details
 *
 * @param {string} userId
 * @param {Partial<import('../../types/api-contracts').User>} updates
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').User>>}
 */
export const updateUser = async (userId, updates) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: PATCH /api/users/:userId
    // Expected request body: { ...updates }
    // Expected response: { success: true, data: {...user} }

    const response = await axios.patch(`/api/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    throw {
      success: false,
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  activateUser,
  deactivateUser,
  resetPassword,
  updateUser
};
