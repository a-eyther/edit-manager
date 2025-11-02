import axiosInstance from '../utils/axios'
import { shouldUseMockAuth } from '../utils/mockAuth'
import * as mockDataService from '../utils/mockDataService'

/**
 * Claims API service
 * Handles all claims-related API calls
 * Supports mock data for development without backend
 */

const claimsService = {
  /**
   * Search diagnoses with query
   * @param {string} query - Search keyword
   * @param {number} page - Page number (default 1)
   * @param {number} pageSize - Number of results per page (default 10)
   * @returns {Promise} API response with diagnoses list
   */
  searchDiagnoses: async (query, page = 1, pageSize = 10) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.getMockDiagnoses(query);
    }

    const response = await axiosInstance.get('/claims/api/diagnoses/', {
      params: {
        query,
        page,
        page_size: pageSize,
      },
    })
    return response.data
  },

  /**
   * Search symptoms with query
   * @param {string} query - Search keyword
   * @param {number} page - Page number (default 1)
   * @param {number} pageSize - Number of results per page (default 10)
   * @returns {Promise} API response with symptoms list
   */
  searchSymptoms: async (query, page = 1, pageSize = 10) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.getMockSymptoms(query);
    }

    const response = await axiosInstance.get('/claims/api/symptoms/', {
      params: {
        query,
        page,
        page_size: pageSize,
      },
    })
    return response.data
  },

  /**
   * Get claim details by ID
   * @param {string} claimId - Claim ID
   * @returns {Promise} API response with claim data
   */
  getClaimById: async (claimId) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.getMockClaimById(claimId);
    }

    const response = await axiosInstance.get(`/claims/api/claims/${claimId}/`)
    return response.data
  },

  /**
   * Get list of claims
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with claims list
   */
  getClaims: async (params = {}) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.getMockClaims(params);
    }

    const response = await axiosInstance.get('/claims/api/claims/', { params })
    return response.data
  },

  /**
   * Update claim
   * @param {string} claimId - Claim ID
   * @param {Object} data - Claim data to update
   * @returns {Promise} API response
   */
  updateClaim: async (claimId, data) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockUpdateClaim(claimId, data);
    }

    const response = await axiosInstance.put(`/claims/api/claims/${claimId}/`, data)
    return response.data
  },

  /**
   * Submit query message
   * @param {FormData} formData - Form data with message, attachments, etc.
   * @returns {Promise} API response
   */
  submitQuery: async (formData) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockSubmitQuery(formData);
    }

    const response = await axiosInstance.post('/claims/api/queries/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Get claim extraction data by claim ID
   * @param {string} claimId - Claim ID
   * @returns {Promise} API response with extraction data
   */
  getClaimExtractionData: async (claimId) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.getMockClaimExtractionData(claimId);
    }

    const response = await axiosInstance.get(`/claims/api/claims/${claimId}/extraction-data/`)
    return response.data
  },

    updateClaimExtractionData: async (claimId, data) => {
        // Use mock data if mock auth is enabled
        if (shouldUseMockAuth()) {
          return mockDataService.mockUpdateExtractionData(claimId, data);
        }

        const response = await axiosInstance.put(`/claims/api/claims/${claimId}/extraction-data/`, data)
        return response.data
    },

  /**
   * Patch claim extraction data by claim unique ID
   * @param {string} claimUniqueId - Claim unique ID
   * @param {Object} data - Partial extraction data with output_data
   * @returns {Promise} API response
   */
  patchClaimExtractionData: async (claimUniqueId, data) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockUpdateExtractionData(claimUniqueId, data);
    }

    const response = await axiosInstance.patch(`/claims/api/claims/${claimUniqueId}/extraction-data/`, data)
    return response.data
  },

  /**
   * Get dropdown options for filters
   * @returns {Promise} API response with providers, benefit_types, and decisions
   */
  getDropdownOptions: async () => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.getMockDropdownOptions();
    }

    const response = await axiosInstance.get('/claims/api/dropdown-options/')
    return response.data
  },

  /**
   * Update manual adjudication for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @param {Object} data - Adjudication data with output_data and manual edits
   * @returns {Promise} API response
   */
  updateManualAdjudication: async (claimUniqueId, data) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockUpdateManualAdjudication(claimUniqueId, data);
    }

    const response = await axiosInstance.put(`/claims/api/claims/${claimUniqueId}/adjudication/manual/`, data)
    return response.data
  },

  /**
   * Get manual adjudication data for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @returns {Promise} API response with manual adjudication data
   */
  getManualAdjudication: async (claimUniqueId) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.getMockManualAdjudication(claimUniqueId);
    }

    const response = await axiosInstance.get(`/claims/api/claims/${claimUniqueId}/adjudication/manual/`)
    return response.data
  },

  /**
   * Get AI adjudication data for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @returns {Promise} API response with AI adjudication data
   */
  getAIAdjudication: async (claimUniqueId) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.getMockAIAdjudication(claimUniqueId);
    }

    const response = await axiosInstance.get(`/claims/api/claims/${claimUniqueId}/adjudication/ai/`)
    return response.data
  },

  /**
   * Trigger re-adjudication for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @returns {Promise} API response
   */
  reAdjudicate: async (claimUniqueId) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockReAdjudicate(claimUniqueId);
    }

    const response = await axiosInstance.post(`/claims/api/claims/${claimUniqueId}/re-adjudicate/`)
    return response.data
  },

  /**
   * Finalize manual adjudication for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @returns {Promise} API response
   */
  finalizeManualAdjudication: async (claimUniqueId) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockFinalizeManualAdjudication(claimUniqueId);
    }

    const response = await axiosInstance.post(`/claims/api/claims/${claimUniqueId}/adjudication/manual/finalize/`)
    return response.data
  },

  /**
   * Submit checklist data for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @param {Object} data - Checklist data
   * @returns {Promise} API response
   */
  submitChecklistData: async (claimUniqueId, data) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockSubmitChecklistData(claimUniqueId, data);
    }

    const response = await axiosInstance.put(`/claims/api/claims/${claimUniqueId}/checklist/`, data)
    return response.data
  },

  /**
   * Assign a claim to current user
   * @param {string} claimUniqueId - Claim unique ID
   * @param {Object} data - Assignment data with duration_minutes
   * @returns {Promise} API response
   */
  assignClaim: async (claimUniqueId, data) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockAssignClaim(claimUniqueId, data);
    }

    const response = await axiosInstance.post(`/claims/api/claims/${claimUniqueId}/assignment/`, data)
    return response.data
  },

  /**
   * Trigger re-digitization for one or more claims
   * @param {Object} payload - Payload with claims array and optional notes
   * @returns {Promise} API response
   */
  redigitizeClaim: async (payload) => {
    // Use mock data if mock auth is enabled
    if (shouldUseMockAuth()) {
      return mockDataService.mockRedigitizeClaim(payload);
    }

    const response = await axiosInstance.post('/claims/api/claims/redigitize/', payload)
    return response.data
  },
}

export default claimsService
