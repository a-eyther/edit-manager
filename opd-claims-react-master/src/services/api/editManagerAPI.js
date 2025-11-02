/**
 * Edit Manager API Service
 *
 * Real backend API calls for Edit Manager features (F1: Re-Adjudication).
 * When backend is ready, implement these functions to call actual endpoints.
 *
 * @module services/api/editManagerAPI
 */

import axios from '../../utils/axios';

/**
 * Re-adjudicate a claim (Manager re-edit)
 *
 * @param {import('../../types/api-contracts').ReAdjudicateRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').ReAdjudicateResponse>>}
 *
 * @example
 * const response = await reAdjudicateClaim({
 *   claimId: 'CLM-3045',
 *   adjudicationData: { approvedAmount: 50000, notes: 'Reviewed' },
 *   assignToEditorId: 'EDR-2000',
 *   notes: 'Quality review completed'
 * });
 */
export const reAdjudicateClaim = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/edit-manager/re-adjudicate
    // Expected request body: { claimId, adjudicationData, assignToEditorId, notes }
    // Expected response: { success: true, data: { claim, lctSubmissionCount, maxReached, assignedEditor, notificationSent } }

    const response = await axios.post('/api/edit-manager/re-adjudicate', request);
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
 * Get claims for Edit Manager dashboard
 *
 * @param {object} params - Query parameters
 * @param {string} [params.status] - Filter by edit status
 * @param {string} [params.assignedTo] - Filter by assigned editor
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=25] - Items per page
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').PaginatedResponse<import('../../types/api-contracts').ManagerClaim>>>}
 */
export const getManagerClaims = async (params = {}) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/edit-manager/claims?status=...&assignedTo=...&page=...&limit=...
    // Expected response: { success: true, data: { data: [...claims], pagination: {...} } }

    const response = await axios.get('/api/edit-manager/claims', { params });
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
 * Get single claim details
 *
 * @param {string} claimId
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').ManagerClaim>>}
 */
export const getClaimById = async (claimId) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/edit-manager/claims/:claimId
    // Expected response: { success: true, data: {...claim} }

    const response = await axios.get(`/api/edit-manager/claims/${claimId}`);
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
 * Get list of active editors for assignment
 *
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<Array<import('../../types/api-contracts').User>>>}
 */
export const getActiveEditors = async () => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/edit-manager/editors/active
    // Expected response: { success: true, data: [...editors] }

    const response = await axios.get('/api/edit-manager/editors/active');
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
  reAdjudicateClaim,
  getManagerClaims,
  getClaimById,
  getActiveEditors
};
