/**
 * Mock Data Service
 * Provides mock API responses for development without backend
 * Wraps the mock data from constants/mockData.jsx and services/mock/mockDatabase.js
 */

import { claimsData, statsData, claimDetailsData } from '../constants/mockData';
import { getClaims, getClaimById as getClaimFromDb } from '../services/mock/mockDatabase';

/**
 * Simulate API delay
 * @param {number} ms - Milliseconds to delay
 */
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Transform claim data from mockDatabase format (camelCase) to API format (snake_case)
 * This ensures compatibility between mock data and real API responses
 *
 * @param {Object} claim - Claim object from mockDatabase (camelCase)
 * @returns {Object} Transformed claim object (snake_case)
 */
const transformClaimToAPIFormat = (claim) => {
  return {
    // Core identification
    id: claim.id,
    claim_unique_id: claim.id, // Use id as unique identifier for navigation
    visit_number: claim.visitNumber,

    // Patient and provider info
    patient_name: claim.patientName,
    provider_name: claim.hospitalName, // Note: hospitalName → provider_name

    // Status and workflow
    edit_status: claim.editStatus,
    decision: 'APPROVED', // All demo claims show approved AI decision

    // Assignment info
    assigned_to: claim.assignedTo,
    assigned_to_name: claim.assignedToName,
    assignment_status: {
      is_assigned: claim.assignedTo !== null,
      assigned_to: claim.assignedTo,
      assigned_to_name: claim.assignedToName,
      assigned_at: claim.assignedTo ? claim.createdAt : null
    },

    // Financial data
    request_amount: claim.requestAmount,
    approved_amount: claim.approvedAmount,
    lct_submission_count: claim.lctSubmissionCount,

    // Timestamps
    created_at: claim.createdAt,
    updated_at: claim.updatedAt,
    time_elapsed: claim.timeElapsed,

    // Additional fields
    benefit_name: 'OPD', // All demo claims are OPD type
    benefit_type: 'OPD',

    // Documents (already in correct format)
    documents: claim.documents || []
  };
};

/**
 * Get paginated claims list
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Paginated claims response
 */
export const getMockClaims = async (params = {}) => {
  await delay(400);

  console.log('📊 Returning mock claims data from mockDatabase...');

  const {
    page = 1,
    page_size = 10,
    search = '',
    final_decision = '',
    provider_name = '',
    benefit_name = '',
  } = params;

  // Get claims from mockDatabase (includes demo claims)
  let filteredClaims = getClaims();

  // Search filter - updated to match mockDatabase field names
  if (search) {
    const searchLower = search.toLowerCase();
    filteredClaims = filteredClaims.filter(claim =>
      (claim.id && claim.id.toLowerCase().includes(searchLower)) ||
      (claim.visitNumber && claim.visitNumber.toLowerCase().includes(searchLower)) ||
      (claim.hospitalName && claim.hospitalName.toLowerCase().includes(searchLower)) ||
      (claim.patientName && claim.patientName.toLowerCase().includes(searchLower))
    );
  }

  // Decision filter - mockDatabase uses editStatus field
  if (final_decision && final_decision !== 'All Decisions') {
    filteredClaims = filteredClaims.filter(claim =>
      claim.editStatus && claim.editStatus.toUpperCase().includes(final_decision.toUpperCase())
    );
  }

  // Provider filter - mockDatabase uses hospitalName field
  if (provider_name && provider_name !== 'All Providers') {
    filteredClaims = filteredClaims.filter(claim =>
      claim.hospitalName === provider_name
    );
  }

  // Benefit type filter - not present in mockDatabase ManagerClaim, skip for now
  if (benefit_name && benefit_name !== 'All Benefit Types') {
    filteredClaims = filteredClaims.filter(claim =>
      claim.benefitType === benefit_name
    );
  }

  // Pagination
  const startIndex = (page - 1) * page_size;
  const endIndex = startIndex + page_size;
  const paginatedClaims = filteredClaims.slice(startIndex, endIndex);

  // Transform claims from camelCase (mockDatabase) to snake_case (API format)
  const transformedClaims = paginatedClaims.map(transformClaimToAPIFormat);

  console.log('📊 Transformed', transformedClaims.length, 'claims to API format (camelCase → snake_case)');

  return {
    count: filteredClaims.length,
    results: transformedClaims, // Return transformed claims
    edit_done_count: statsData.editDone,
    edit_pending_count: statsData.editPending,
    next: endIndex < filteredClaims.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
  };
};

/**
 * Get single claim details by ID
 * @param {string} claimId - Claim ID
 * @returns {Promise<Object>} Claim details
 */
export const getMockClaimById = async (claimId) => {
  await delay(300);

  console.log(`📋 Returning mock claim details for ID: ${claimId}`);

  // Find basic claim data
  const basicClaim = claimsData.find(c => c.id === claimId);

  if (!basicClaim) {
    throw new Error(`Claim ${claimId} not found`);
  }

  // Get detailed claim data if available, otherwise use basic data
  const detailedClaim = claimDetailsData[claimId] || {
    claimId: basicClaim.id,
    status: basicClaim.decision,
    benefitType: basicClaim.benefit_type,
    timer: '05:00',
    timerStatus: 'IN PROGRESS',
    totalPages: 5,
    financials: {
      totalRequested: 15000,
      preAuthAmount: 14000,
      approved: 13500,
      totalInvoiced: 15000,
      totalApproved: 13500,
      totalSavings: 1500
    },
    patient: {
      name: 'SAMPLE PATIENT',
      relation: 'Self',
      beneficiaryName: 'Sample Beneficiary',
      visitNumber: basicClaim.visit_number,
      claimNumber: basicClaim.id,
      claimCreated: new Date(basicClaim.created_at).toLocaleString(),
      currentDecision: basicClaim.decision
    },
    claim: {
      hospital: basicClaim.provider_name,
      invoiceNumbers: 'INV-2025-001',
      invoiceId: 'inv_sample',
      invoiceDate: new Date(basicClaim.created_at).toLocaleDateString(),
      vettingStatus: 'Pending Review'
    },
    policy: {
      policyNumber: 'POL-001',
      schemeName: 'STANDARD INSURANCE SCHEME',
      policyPeriod: '2025/01/01 → 2025/12/31',
      policyStatus: 'Active',
      benefitType: basicClaim.benefit_type,
      benefitName: basicClaim.benefit_name
    }
  };

  // Transform to API format if claim comes from mockDatabase
  const transformedClaim = basicClaim.visitNumber
    ? transformClaimToAPIFormat(basicClaim)
    : basicClaim;

  return {
    ...transformedClaim,
    ...detailedClaim,
    claim_unique_id: transformedClaim.claim_unique_id || transformedClaim.id || `CLAIM-${claimId}`,
    assignment_status: 'assigned',
    assigned_to: 'Current User',
    documents: transformedClaim.documents || basicClaim.documents || [] // Include documents from mock database
  };
};

/**
 * Get mock claim extraction data
 * @param {string} claimId - Claim ID
 * @returns {Promise<Object>} Extraction data
 */
export const getMockClaimExtractionData = async (claimId) => {
  await delay(400);

  console.log(`🔍 Returning mock extraction data for claim: ${claimId}`);

  // Get the full claim object from mock database to include documents
  const basicClaim = getClaimFromDb(claimId);

  // Fallback: If not found in mockDatabase, check claimDetailsData from mockData.jsx
  // (claimDetailsData is already imported at top of file)
  const detailedData = claimDetailsData?.[claimId];

  // Get documents from either source
  const documents = basicClaim?.documents || detailedData?.documents || [];

  console.log(`📄 Found ${documents.length} documents for claim ${claimId} (source: ${basicClaim?.documents ? 'mockDatabase' : detailedData?.documents ? 'claimDetailsData' : 'none'})`);

  return {
    data: {
      claim_unique_id: claimId.startsWith('CLAIM-') ? claimId : `CLAIM-${claimId}`,
      documents: documents, // Include documents from mock database or claimDetailsData
      output_data: {
        billing_data: [
          {
            item_name: 'General Consultation',
            quantity: 1,
            request_amount: 500,
            invoice_number: 'INV-001',
            invoice_id: 'inv_001',
            item_category: 'Consultation'
          },
          {
            item_name: 'Blood Test',
            quantity: 1,
            request_amount: 1500,
            invoice_number: 'INV-001',
            invoice_id: 'inv_001',
            item_category: 'Laboratory'
          },
          {
            item_name: 'Prescription Medicine',
            quantity: 3,
            request_amount: 3000,
            invoice_number: 'INV-001',
            invoice_id: 'inv_001',
            item_category: 'Pharmacy'
          }
        ]
      }
    }
  };
};

/**
 * Get mock manual adjudication data
 * @param {string} claimUniqueId - Claim unique ID
 * @returns {Promise<Object>} Manual adjudication data
 */
export const getMockManualAdjudication = async (claimUniqueId) => {
  await delay(400);

  console.log(`⚖️ Returning mock adjudication data for: ${claimUniqueId}`);

  // Use the detailed mock data from constants
  const claimId = claimUniqueId.replace('CLAIM-', '');
  const detailedData = claimDetailsData[claimId];

  if (detailedData && detailedData.clinicalValidationInvoices) {
    return {
      data: {
        claim_unique_id: claimUniqueId,
        adjudication_response: {
          billing_data: detailedData.clinicalValidationInvoices.flatMap(invoice =>
            invoice.items.map(item => ({
              ...item,
              item_name: item.medicineName,
              quantity: item.invQty,
              approved_quantity: item.appQty,
              unit_price: item.unitPrice,
              request_amount: item.invAmt,
              tariff_amount: item.preauthAmt,
              approved_amount: item.appAmt,
              savings: item.savings,
              invoice_number: item.invoiceNo,
              item_category: item.category,
              message: item.systemReason,
              editor_reason: item.editorReason
            }))
          )
        }
      }
    };
  }

  // Default adjudication data
  return {
    data: {
      claim_unique_id: claimUniqueId,
      adjudication_response: {
        billing_data: [
          {
            item_name: 'General Consultation',
            quantity: 1,
            approved_quantity: 1,
            unit_price: 500,
            request_amount: 500,
            tariff_amount: 500,
            approved_amount: 500,
            savings: 0,
            invoice_number: 'INV-001',
            item_category: 'Consultation',
            message: 'Approved',
            editor_reason: ''
          }
        ]
      }
    }
  };
};

/**
 * Get mock AI adjudication data
 * @param {string} claimUniqueId - Claim unique ID
 * @returns {Promise<Object>} AI adjudication data
 */
export const getMockAIAdjudication = async (claimUniqueId) => {
  await delay(300);
  console.log(`🤖 Returning mock AI adjudication for: ${claimUniqueId}`);
  return getMockManualAdjudication(claimUniqueId);
};

/**
 * Mock dropdown options
 * @returns {Promise<Object>} Dropdown options
 */
export const getMockDropdownOptions = async () => {
  await delay(200);

  console.log('📝 Returning mock dropdown options...');

  return {
    providers: [
      'MOI Teaching and Referral Hospital',
      'Kenyatta National Hospital',
      'Aga Khan University Hospital',
      'The Nairobi Hospital',
    ],
    benefit_types: ['OPD', 'DENTAL', 'OPTICAL'],
    decisions: ['APPROVED', 'REJECTED', 'MODIFIED & APPROVED', 'DECISION PENDING'],
  };
};

/**
 * Mock diagnoses search
 * @param {string} query - Search query
 * @returns {Promise<Object>} Diagnoses list
 */
export const getMockDiagnoses = async (query) => {
  await delay(300);

  console.log(`🔬 Searching mock diagnoses for: ${query}`);

  const mockDiagnoses = [
    { id: 1, code: 'R51', name: 'Headache', description: 'General headache condition' },
    { id: 2, code: 'G43', name: 'Migraine', description: 'Chronic migraine condition' },
    { id: 3, code: 'J06', name: 'Respiratory Infection', description: 'Upper respiratory tract infection' },
    { id: 4, code: 'K02', name: 'Dental Caries', description: 'Tooth decay' },
    { id: 5, code: 'H52', name: 'Refractive Error', description: 'Vision problems' },
  ];

  const filtered = query
    ? mockDiagnoses.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.code.toLowerCase().includes(query.toLowerCase())
      )
    : mockDiagnoses;

  return {
    results: filtered,
    count: filtered.length,
  };
};

/**
 * Mock symptoms search
 * @param {string} query - Search query
 * @returns {Promise<Object>} Symptoms list
 */
export const getMockSymptoms = async (query) => {
  await delay(300);

  console.log(`🩺 Searching mock symptoms for: ${query}`);

  const mockSymptoms = [
    { id: 1, name: 'Fever', description: 'Elevated body temperature' },
    { id: 2, name: 'Cough', description: 'Persistent coughing' },
    { id: 3, name: 'Headache', description: 'Pain in head region' },
    { id: 4, name: 'Nausea', description: 'Feeling of sickness' },
    { id: 5, name: 'Fatigue', description: 'Extreme tiredness' },
  ];

  const filtered = query
    ? mockSymptoms.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
    : mockSymptoms;

  return {
    results: filtered,
    count: filtered.length,
  };
};

/**
 * Mock claim assignment
 * @param {string} claimUniqueId - Claim unique ID
 * @param {Object} data - Assignment data
 * @returns {Promise<Object>} Assignment result
 */
export const mockAssignClaim = async (claimUniqueId, data) => {
  await delay(200);

  console.log(`📌 Mock assigning claim: ${claimUniqueId}`, data);

  return {
    success: true,
    message: 'Claim assigned successfully',
    assignment_status: 'assigned',
    duration_minutes: data.duration_minutes,
  };
};

/**
 * Mock update extraction data
 * @param {string} claimUniqueId - Claim unique ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Update result
 */
export const mockUpdateExtractionData = async (claimUniqueId, data) => {
  await delay(500);

  console.log(`💾 Mock updating extraction data for: ${claimUniqueId}`);

  return {
    success: true,
    message: 'Extraction data updated successfully',
    data: data,
  };
};

/**
 * Mock update manual adjudication
 * @param {string} claimUniqueId - Claim unique ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Update result
 */
export const mockUpdateManualAdjudication = async (claimUniqueId, data) => {
  await delay(500);

  console.log(`⚖️ Mock updating manual adjudication for: ${claimUniqueId}`);

  return {
    success: true,
    message: 'Manual adjudication updated successfully',
    data: data,
  };
};

/**
 * Mock finalize manual adjudication
 * @param {string} claimUniqueId - Claim unique ID
 * @returns {Promise<Object>} Finalize result
 */
export const mockFinalizeManualAdjudication = async (claimUniqueId) => {
  await delay(500);

  console.log(`✅ Mock finalizing manual adjudication for: ${claimUniqueId}`);

  return {
    success: true,
    message: 'Manual adjudication finalized successfully',
  };
};

/**
 * Mock submit checklist
 * @param {string} claimUniqueId - Claim unique ID
 * @param {Object} data - Checklist data
 * @returns {Promise<Object>} Submit result
 */
export const mockSubmitChecklistData = async (claimUniqueId, data) => {
  await delay(300);

  console.log(`✔️ Mock submitting checklist for: ${claimUniqueId}`, data);

  return {
    success: true,
    message: 'Checklist submitted successfully',
  };
};

/**
 * Mock update claim
 * @param {string} claimId - Claim ID
 * @param {Object} data - Updated claim data
 * @returns {Promise<Object>} Update result
 */
export const mockUpdateClaim = async (claimId, data) => {
  await delay(400);

  console.log(`📝 Mock updating claim: ${claimId}`, data);

  return {
    success: true,
    message: 'Claim updated successfully',
    data: data,
  };
};

/**
 * Mock submit query
 * @param {FormData} formData - Query form data
 * @returns {Promise<Object>} Submit result
 */
export const mockSubmitQuery = async (formData) => {
  await delay(500);

  console.log(`💬 Mock submitting query...`);

  return {
    success: true,
    message: 'Query submitted successfully',
    query_id: 'QUERY-' + Date.now(),
  };
};

/**
 * Mock re-adjudicate claim
 * @param {string} claimUniqueId - Claim unique ID
 * @returns {Promise<Object>} Re-adjudication result
 */
export const mockReAdjudicate = async (claimUniqueId) => {
  await delay(800);

  console.log(`🔄 Mock re-adjudicating claim: ${claimUniqueId}`);

  return {
    success: true,
    message: 'Re-adjudication triggered successfully',
    status: 'processing',
  };
};

/**
 * Mock redigitize claims
 * @param {Object} payload - Redigitize payload with claims array
 * @returns {Promise<Object>} Redigitize result
 */
export const mockRedigitizeClaim = async (payload) => {
  await delay(600);

  console.log(`🔄 Mock redigitizing claims:`, payload);

  return {
    success: true,
    message: 'Redigitization triggered successfully',
    claims_count: payload.claims?.length || 1,
  };
};
