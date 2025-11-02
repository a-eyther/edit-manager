/**
 * Reassignment API Service
 *
 * Real backend API calls for claim reassignment features (F2: Claim Reassignment).
 * When backend is ready, implement these functions to call actual endpoints.
 *
 * @module services/api/reassignmentAPI
 */

import axios from '../../utils/axios';

/**
 * Standard reassign (for claims not yet started)
 *
 * @param {import('../../types/api-contracts').ReassignClaimRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').ReassignClaimResponse>>}
 *
 * @example
 * const response = await standardReassign({
 *   claimId: 'CLM-3045',
 *   fromEditorId: 'EDR-2001',
 *   toEditorId: 'EDR-2002',
 *   type: 'STANDARD'
 * });
 */
export const standardReassign = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/edit-manager/reassign
    // Expected request body: { claimId, fromEditorId, toEditorId, type: 'STANDARD', reason? }
    // Expected response: { success: true, data: { claim, previousEditor, newEditor, type, wasForced, notificationsSent } }

    const response = await axios.post('/api/edit-manager/reassign', request);
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
 * Force reassign (for claims in progress)
 *
 * @param {import('../../types/api-contracts').ReassignClaimRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').ReassignClaimResponse>>}
 *
 * @example
 * const response = await forceReassign({
 *   claimId: 'CLM-3046',
 *   fromEditorId: 'EDR-2001',
 *   toEditorId: 'EDR-2003',
 *   type: 'FORCE',
 *   reason: 'Urgent reallocation needed'
 * });
 */
export const forceReassign = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/edit-manager/reassign/force
    // Expected request body: { claimId, fromEditorId, toEditorId, type: 'FORCE', reason? }
    // Expected response: { success: true, data: { claim, previousEditor, newEditor, type, wasForced: true, notificationsSent } }

    const response = await axios.post('/api/edit-manager/reassign/force', request);
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
 * Bulk reassignment
 *
 * @param {import('../../types/api-contracts').BulkReassignRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').BulkReassignResponse>>}
 *
 * @example
 * const response = await bulkReassign({
 *   claimIds: ['CLM-3045', 'CLM-3046', 'CLM-3047'],
 *   toEditorId: 'EDR-2004',
 *   type: 'STANDARD'
 * });
 */
export const bulkReassign = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/edit-manager/reassign/bulk
    // Expected request body: { claimIds: [...], toEditorId, type }
    // Expected response: { success: true, data: { successCount, failureCount, results: [...] } }

    const response = await axios.post('/api/edit-manager/reassign/bulk', request);
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
 * Auto-redistribute claims (triggered on user deactivation)
 *
 * @param {string} fromUserId - User being deactivated
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<{redistributedCount: number, details: Array}>>}
 */
export const autoRedistribute = async (fromUserId) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: POST /api/edit-manager/redistribute
    // Expected request body: { fromUserId }
    // Expected response: { success: true, data: { redistributedCount, details: [...] } }

    const response = await axios.post('/api/edit-manager/redistribute', { fromUserId });
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
 * Get reassignment history for a claim
 *
 * @param {string} claimId
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<Array<import('../../types/api-contracts').AuditLogEntry>>>}
 */
export const getReassignmentHistory = async (claimId) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/edit-manager/claims/:claimId/reassignments
    // Expected response: { success: true, data: [...audit entries] }

    const response = await axios.get(`/api/edit-manager/claims/${claimId}/reassignments`);
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
  standardReassign,
  forceReassign,
  bulkReassign,
  autoRedistribute,
  getReassignmentHistory
};
