/**
 * Edit Manager Mock Service - Re-Adjudication (F1)
 *
 * Implements re-adjudication business logic with LCT submission count tracking.
 * Follows PRD requirements for manager re-edit workflows.
 */

import {
  EditStatus,
  AuditEventType,
  NotificationType,
  UserRole
} from '../../types/api-contracts';

import {
  getClaimById,
  getUserById,
  getActiveEditors,
  updateClaim,
  reassignClaim,
  addAuditEntry,
  addNotification
} from './mockDatabase';

/**
 * Simulate API delay
 */
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Re-adjudicate claim (F1)
 *
 * Business Rules:
 * - LCT count must not exceed 3
 * - Cannot re-edit if count = 3
 * - Must assign to an editor after re-adjudication
 * - Audit trail entry required
 * - Notification sent to assigned editor
 *
 * @param {object} request - ReAdjudicateRequest
 * @returns {Promise<object>} ReAdjudicateResponse
 */
export const reAdjudicateClaim = async (request) => {
  await simulateDelay(350);

  try {
    const { claimId, adjudicationData, assignToEditorId, notes } = request;

    // Validate claim exists
    const claim = getClaimById(claimId);
    if (!claim) {
      return {
        success: false,
        error: 'CLAIM_NOT_FOUND',
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      };
    }

    // Validate claim is adjudicated
    if (claim.editStatus !== EditStatus.ADJUDICATED && claim.editStatus !== EditStatus.RE_ADJUDICATED) {
      return {
        success: false,
        error: 'INVALID_STATUS',
        message: 'Claim must be in ADJUDICATED or RE_ADJUDICATED status for re-editing',
        timestamp: new Date().toISOString()
      };
    }

    // Validate LCT submission count
    if (claim.lctSubmissionCount >= 3) {
      return {
        success: false,
        error: 'MAX_LCT_REACHED',
        message: 'Maximum LCT submission count (3) reached. Cannot re-edit this claim.',
        timestamp: new Date().toISOString()
      };
    }

    // Validate target editor
    const targetEditor = getUserById(assignToEditorId);
    if (!targetEditor) {
      return {
        success: false,
        error: 'EDITOR_NOT_FOUND',
        message: 'Target editor not found',
        timestamp: new Date().toISOString()
      };
    }

    if (targetEditor.role !== UserRole.EDITOR) {
      return {
        success: false,
        error: 'INVALID_ROLE',
        message: 'Target user must have EDITOR role',
        timestamp: new Date().toISOString()
      };
    }

    if (targetEditor.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'EDITOR_INACTIVE',
        message: 'Target editor is inactive and cannot be assigned claims',
        timestamp: new Date().toISOString()
      };
    }

    // Calculate new LCT submission count
    const newLctCount = claim.lctSubmissionCount + 1;
    const maxReached = newLctCount >= 3;

    // Extract approved amount from adjudication data (if available)
    const newApprovedAmount = adjudicationData?.approvedAmount || claim.approvedAmount;

    // Update claim
    const previousApprovedAmount = claim.approvedAmount;
    updateClaim(claimId, {
      editStatus: EditStatus.PENDING, // Set to PENDING so editor can work on it (normal edit flow)
      lctSubmissionCount: newLctCount,
      approvedAmount: newApprovedAmount
    });

    // Reassign to target editor
    const managerId = 'MGR-1000'; // Mock manager ID - would come from auth context
    const managerName = 'Dr. Suresh Menon'; // Mock manager name
    reassignClaim(claimId, claim.assignedTo, assignToEditorId, 'RE_ADJUDICATION', managerId);

    // Get updated claim
    const updatedClaim = getClaimById(claimId);

    // Create audit log entry
    addAuditEntry({
      eventType: AuditEventType.CLAIM_RE_ADJUDICATED,
      claimId,
      userId: assignToEditorId,
      userName: targetEditor.name,
      performedBy: managerId,
      performedByName: managerName,
      details: {
        lctSubmissionCount: newLctCount,
        maxReached,
        previousApprovedAmount,
        newApprovedAmount,
        previousAssignee: claim.assignedTo,
        newAssignee: assignToEditorId,
        notes: notes || null,
        adjudicationDataKeys: Object.keys(adjudicationData || {})
      }
    });

    // Send notification to assigned editor
    const notificationMessage = maxReached
      ? `Claim ${claim.visitNumber} assigned for final re-review (LCT submission 3/3). This is the last possible re-edit.`
      : `Claim ${claim.visitNumber} assigned for re-review by ${managerName}. LCT submission ${newLctCount}/3.`;

    addNotification({
      type: NotificationType.CLAIM_ASSIGNED,
      title: maxReached ? 'Final Re-Review Required' : 'Claim Re-Assigned for Re-Review',
      message: notificationMessage,
      claimId,
      userId: assignToEditorId
    });

    // Also notify previous editor if different
    if (claim.assignedTo && claim.assignedTo !== assignToEditorId) {
      addNotification({
        type: NotificationType.CLAIM_REASSIGNED,
        title: 'Claim Re-Adjudicated by Manager',
        message: `Claim ${claim.visitNumber} has been re-adjudicated by ${managerName} and reassigned to ${targetEditor.name}`,
        claimId,
        userId: claim.assignedTo
      });
    }

    // Return successful response
    return {
      success: true,
      data: {
        claim: {
          id: updatedClaim.id,
          visitNumber: updatedClaim.visitNumber,
          patientName: updatedClaim.patientName,
          hospitalName: updatedClaim.hospitalName,
          editStatus: updatedClaim.editStatus,
          assignedTo: updatedClaim.assignedTo,
          assignedToName: updatedClaim.assignedToName,
          lctSubmissionCount: updatedClaim.lctSubmissionCount,
          requestAmount: updatedClaim.requestAmount,
          approvedAmount: updatedClaim.approvedAmount,
          createdAt: updatedClaim.createdAt,
          updatedAt: updatedClaim.updatedAt,
          timeElapsed: 0 // Reset timer on re-assignment
        },
        lctSubmissionCount: newLctCount,
        maxReached,
        assignedEditor: {
          id: targetEditor.id,
          name: targetEditor.name,
          email: targetEditor.email
        },
        notificationSent: true
      },
      message: maxReached
        ? `Claim re-adjudicated successfully and assigned to ${targetEditor.name}. Maximum LCT submissions reached (3/3).`
        : `Claim re-adjudicated successfully and assigned to ${targetEditor.name}. LCT submission count: ${newLctCount}/3.`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Re-adjudication error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred during re-adjudication',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Validate if claim can be re-adjudicated
 *
 * @param {string} claimId
 * @returns {Promise<object>} Validation result
 */
export const canReAdjudicate = async (claimId) => {
  await simulateDelay(100);

  try {
    const claim = getClaimById(claimId);

    if (!claim) {
      return {
        success: false,
        canReAdjudicate: false,
        reason: 'CLAIM_NOT_FOUND',
        message: 'Claim not found'
      };
    }

    // Check status
    if (claim.editStatus !== EditStatus.ADJUDICATED && claim.editStatus !== EditStatus.RE_ADJUDICATED) {
      return {
        success: true,
        canReAdjudicate: false,
        reason: 'INVALID_STATUS',
        message: 'Claim has not been adjudicated yet',
        claim: {
          id: claim.id,
          editStatus: claim.editStatus,
          lctSubmissionCount: claim.lctSubmissionCount
        }
      };
    }

    // Check LCT count
    if (claim.lctSubmissionCount >= 3) {
      return {
        success: true,
        canReAdjudicate: false,
        reason: 'MAX_LCT_REACHED',
        message: 'Maximum LCT submission count reached (3/3)',
        claim: {
          id: claim.id,
          editStatus: claim.editStatus,
          lctSubmissionCount: claim.lctSubmissionCount
        }
      };
    }

    // Can re-adjudicate
    return {
      success: true,
      canReAdjudicate: true,
      message: 'Claim can be re-adjudicated',
      claim: {
        id: claim.id,
        editStatus: claim.editStatus,
        lctSubmissionCount: claim.lctSubmissionCount,
        remainingReEdits: 3 - claim.lctSubmissionCount
      }
    };
  } catch (error) {
    console.error('[Mock] Validation error:', error);
    return {
      success: false,
      canReAdjudicate: false,
      reason: 'INTERNAL_ERROR',
      message: error.message
    };
  }
};

/**
 * Get available editors for re-adjudication assignment
 *
 * @returns {Promise<object>} List of active editors with queue counts
 */
export const getAvailableEditorsForReAdjudication = async () => {
  await simulateDelay(200);

  try {
    const activeEditors = getActiveEditors();

    const editorsWithCounts = activeEditors.map(editor => ({
      id: editor.id,
      name: editor.name,
      email: editor.email,
      claimsAssigned: editor.claimsAssigned,
      status: editor.status,
      lastLogin: editor.lastLogin
    }));

    // Sort by queue count (ascending) - helps with load balancing
    editorsWithCounts.sort((a, b) => a.claimsAssigned - b.claimsAssigned);

    return {
      success: true,
      data: editorsWithCounts,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Get editors error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get re-adjudication history for a claim
 *
 * @param {string} claimId
 * @returns {Promise<object>} Re-adjudication history
 */
export const getReAdjudicationHistory = async (claimId) => {
  await simulateDelay(250);

  try {
    const claim = getClaimById(claimId);
    if (!claim) {
      return {
        success: false,
        error: 'CLAIM_NOT_FOUND',
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      };
    }

    // Get all re-adjudication audit entries for this claim
    const { getAuditLog } = await import('./mockDatabase');
    const auditEntries = getAuditLog({
      claimId,
      eventTypes: [AuditEventType.CLAIM_RE_ADJUDICATED, AuditEventType.CLAIM_ADJUDICATED]
    });

    return {
      success: true,
      data: {
        claimId,
        currentLctCount: claim.lctSubmissionCount,
        maxReached: claim.lctSubmissionCount >= 3,
        history: auditEntries
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Get history error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Re-export mockDatabase functions for convenience
import { getClaims as getManagerClaims } from './mockDatabase';

/**
 * Wrap getActiveEditors with proper response format
 */
const getActiveEditorsWrapped = async () => {
  await simulateDelay(200);
  const editors = getActiveEditors();
  return {
    success: true,
    data: editors,
    timestamp: new Date().toISOString()
  };
};

export default {
  reAdjudicateClaim,
  canReAdjudicate,
  getAvailableEditorsForReAdjudication,
  getReAdjudicationHistory,
  // Additional exports for UI components
  getManagerClaims,
  getClaimById,
  getActiveEditors: getActiveEditorsWrapped
};
