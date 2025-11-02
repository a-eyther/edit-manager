/**
 * Analytics API Service
 *
 * Real backend API calls for analytics and reporting features (F4: Analytics).
 * When backend is ready, implement these functions to call actual endpoints.
 *
 * @module services/api/analyticsAPI
 */

import axios from '../../utils/axios';

/**
 * Get individual editor analytics
 *
 * @param {import('../../types/api-contracts').EditorAnalyticsRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').EditorAnalyticsResponse>>}
 *
 * @example
 * const response = await getEditorAnalytics({
 *   editorId: 'EDR-2001',
 *   startDate: '2025-10-01',
 *   endDate: '2025-10-31'
 * });
 */
export const getEditorAnalytics = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/analytics/editor/:editorId?startDate=...&endDate=...
    // Expected response: { success: true, data: { editor, dateRange, keyMetrics, outcomes, qualityIndicators, trends, recentClaims, averageProcessingTime, productivityScore } }

    const { editorId, startDate, endDate } = request;
    const response = await axios.get(`/api/analytics/editor/${editorId}`, {
      params: { startDate, endDate }
    });
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
 * Get team-wide analytics
 *
 * @param {object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<object>>}
 */
export const getTeamAnalytics = async (params) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/analytics/team?startDate=...&endDate=...
    // Expected response: { success: true, data: { totalClaims, totalAdjudications, averageProcessingTime, topPerformers: [...], bottomPerformers: [...] } }

    const response = await axios.get('/api/analytics/team', { params });
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
 * Get real-time capacity view
 *
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').CapacityViewResponse>>}
 *
 * @example
 * const response = await getCapacityView();
 */
export const getCapacityView = async () => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/analytics/capacity
    // Expected response: { success: true, data: { totalEditors, activeEditors, totalClaims, averageQueueSize, editors: [...], lastUpdated } }

    const response = await axios.get('/api/analytics/capacity');
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
 * Get audit trail with pagination and filters
 *
 * @param {import('../../types/api-contracts').AuditLogRequest} request
 * @returns {Promise<import('../../types/api-contracts').ApiResponse<import('../../types/api-contracts').PaginatedResponse<import('../../types/api-contracts').AuditLogEntry>>>}
 *
 * @example
 * const response = await getAuditTrail({
 *   eventTypes: ['CLAIM_REASSIGNED', 'USER_DEACTIVATED'],
 *   startDate: '2025-10-01',
 *   endDate: '2025-10-31',
 *   page: 1,
 *   limit: 50
 * });
 */
export const getAuditTrail = async (request) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/analytics/audit?eventTypes=...&claimId=...&userId=...&startDate=...&endDate=...&search=...&page=...&limit=...
    // Expected response: { success: true, data: { data: [...audit entries], pagination: {...} } }

    const response = await axios.get('/api/analytics/audit', { params: request });
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
 * Export analytics data to CSV
 *
 * @param {object} params - Export parameters
 * @param {string} params.type - Export type ('editor' | 'team' | 'audit')
 * @param {string} [params.editorId] - Editor ID (for editor export)
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportAnalytics = async (params) => {
  try {
    // TODO: Implement when backend endpoint is ready
    // Expected endpoint: GET /api/analytics/export?type=...&editorId=...&startDate=...&endDate=...
    // Expected response: CSV file (blob)

    const response = await axios.get('/api/analytics/export', {
      params,
      responseType: 'blob'
    });
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
  getEditorAnalytics,
  getTeamAnalytics,
  getCapacityView,
  getAuditTrail,
  exportAnalytics
};
