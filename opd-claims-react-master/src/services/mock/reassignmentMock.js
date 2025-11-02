/**
 * Claim Reassignment Mock Service (F2)
 *
 * Implements standard and force reassignment business logic.
 * Follows PRD requirements for claim redistribution workflows.
 */

import {
  EditStatus,
  ReassignmentType,
  AuditEventType,
  NotificationType,
  UserStatus
} from '../../types/api-contracts';

import {
  getClaimById,
  getUserById,
  getActiveEditors,
  reassignClaim,
  addAuditEntry,
  addNotification,
  getClaimsByEditor
} from './mockDatabase';

/**
 * Simulate API delay
 */
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Standard reassignment (for not-started claims)
 *
 * Business Rules:
 * - Only for claims with EditStatus = PENDING
 * - "Started" = editor clicked "Save and Next" on first page
 * - Creates audit log entry
 * - Sends notifications to both editors
 *
 * @param {object} request - ReassignClaimRequest
 * @returns {Promise<object>} ReassignClaimResponse
 */
export const standardReassign = async (request) => {
  await simulateDelay(350);

  try {
    const { claimId, fromEditorId, toEditorId, reason } = request;

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

    // Validate claim is not started (PENDING status)
    if (claim.editStatus !== EditStatus.PENDING) {
      return {
        success: false,
        error: 'CLAIM_ALREADY_STARTED',
        message: `Claim is ${claim.editStatus}. Use force reassignment for in-progress claims.`,
        timestamp: new Date().toISOString()
      };
    }

    // Validate source editor
    if (claim.assignedTo !== fromEditorId) {
      return {
        success: false,
        error: 'INVALID_SOURCE_EDITOR',
        message: 'Claim is not assigned to the specified source editor',
        timestamp: new Date().toISOString()
      };
    }

    // Validate target editor
    const targetEditor = getUserById(toEditorId);
    if (!targetEditor) {
      return {
        success: false,
        error: 'EDITOR_NOT_FOUND',
        message: 'Target editor not found',
        timestamp: new Date().toISOString()
      };
    }

    if (targetEditor.status !== UserStatus.ACTIVE) {
      return {
        success: false,
        error: 'EDITOR_INACTIVE',
        message: 'Target editor is inactive and cannot be assigned claims',
        timestamp: new Date().toISOString()
      };
    }

    // Cannot reassign to same editor
    if (fromEditorId === toEditorId) {
      return {
        success: false,
        error: 'SAME_EDITOR',
        message: 'Cannot reassign claim to the same editor',
        timestamp: new Date().toISOString()
      };
    }

    // Get previous editor details
    const previousEditor = getUserById(fromEditorId);
    const previousEditorName = previousEditor?.name || 'Unknown';

    // Perform reassignment
    const managerId = 'MGR-1000'; // Mock manager ID
    const managerName = 'Dr. Suresh Menon'; // Mock manager name
    reassignClaim(claimId, fromEditorId, toEditorId, ReassignmentType.STANDARD, managerId);

    // Get updated claim and editor details
    const updatedClaim = getClaimById(claimId);
    const updatedTargetEditor = getUserById(toEditorId);

    // Create audit log entry
    addAuditEntry({
      eventType: AuditEventType.CLAIM_REASSIGNED,
      claimId,
      userId: toEditorId,
      userName: targetEditor.name,
      performedBy: managerId,
      performedByName: managerName,
      details: {
        previousAssignee: fromEditorId,
        previousAssigneeName: previousEditorName,
        newAssignee: toEditorId,
        newAssigneeName: targetEditor.name,
        reassignmentType: ReassignmentType.STANDARD,
        reason: reason || 'Standard reassignment'
      }
    });

    // Send notification to previous editor
    addNotification({
      type: NotificationType.CLAIM_REASSIGNED,
      title: 'Claim Reassigned',
      message: `Claim ${claim.visitNumber} has been reassigned to ${targetEditor.name} by ${managerName}`,
      claimId,
      userId: fromEditorId
    });

    // Send notification to new editor
    addNotification({
      type: NotificationType.CLAIM_ASSIGNED,
      title: 'New Claim Assigned',
      message: `Claim ${claim.visitNumber} has been assigned to you by ${managerName}`,
      claimId,
      userId: toEditorId
    });

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
          timeElapsed: 0 // Reset timer
        },
        previousEditor: {
          id: fromEditorId,
          name: previousEditorName
        },
        newEditor: {
          id: toEditorId,
          name: targetEditor.name,
          currentQueueCount: updatedTargetEditor.claimsAssigned
        },
        type: ReassignmentType.STANDARD,
        wasForced: false,
        notificationsSent: {
          previousEditor: true,
          newEditor: true
        }
      },
      message: `Claim successfully reassigned from ${previousEditorName} to ${targetEditor.name}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Standard reassignment error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred during reassignment',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Force reassignment (for in-progress claims)
 *
 * Business Rules:
 * - For claims with EditStatus = IN_PROGRESS
 * - Discards unsaved changes
 * - Preserves all saved progress
 * - Requires double confirmation
 * - Marks claim as urgent for new editor
 *
 * @param {object} request - ReassignClaimRequest
 * @returns {Promise<object>} ReassignClaimResponse
 */
export const forceReassign = async (request) => {
  await simulateDelay(400);

  try {
    const { claimId, fromEditorId, toEditorId, reason } = request;

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

    // Validate claim is in progress
    if (claim.editStatus !== EditStatus.IN_PROGRESS) {
      return {
        success: false,
        error: 'CLAIM_NOT_IN_PROGRESS',
        message: 'Force reassignment is only for in-progress claims. Use standard reassignment for pending claims.',
        timestamp: new Date().toISOString()
      };
    }

    // Validate source editor
    if (claim.assignedTo !== fromEditorId) {
      return {
        success: false,
        error: 'INVALID_SOURCE_EDITOR',
        message: 'Claim is not assigned to the specified source editor',
        timestamp: new Date().toISOString()
      };
    }

    // Validate target editor
    const targetEditor = getUserById(toEditorId);
    if (!targetEditor) {
      return {
        success: false,
        error: 'EDITOR_NOT_FOUND',
        message: 'Target editor not found',
        timestamp: new Date().toISOString()
      };
    }

    if (targetEditor.status !== UserStatus.ACTIVE) {
      return {
        success: false,
        error: 'EDITOR_INACTIVE',
        message: 'Target editor is inactive and cannot be assigned claims',
        timestamp: new Date().toISOString()
      };
    }

    // Cannot reassign to same editor
    if (fromEditorId === toEditorId) {
      return {
        success: false,
        error: 'SAME_EDITOR',
        message: 'Cannot reassign claim to the same editor',
        timestamp: new Date().toISOString()
      };
    }

    // Get previous editor details
    const previousEditor = getUserById(fromEditorId);
    const previousEditorName = previousEditor?.name || 'Unknown';

    // Perform reassignment
    const managerId = 'MGR-1000'; // Mock manager ID
    const managerName = 'Dr. Suresh Menon'; // Mock manager name
    reassignClaim(claimId, fromEditorId, toEditorId, ReassignmentType.FORCE, managerId);

    // Get updated claim and editor details
    const updatedClaim = getClaimById(claimId);
    const updatedTargetEditor = getUserById(toEditorId);

    // Create audit log entry
    addAuditEntry({
      eventType: AuditEventType.CLAIM_FORCE_REASSIGNED,
      claimId,
      userId: toEditorId,
      userName: targetEditor.name,
      performedBy: managerId,
      performedByName: managerName,
      details: {
        previousAssignee: fromEditorId,
        previousAssigneeName: previousEditorName,
        newAssignee: toEditorId,
        newAssigneeName: targetEditor.name,
        reassignmentType: ReassignmentType.FORCE,
        reason: reason || 'Force reassignment - in progress claim',
        savedProgressPreserved: true,
        unsavedChangesDiscarded: true,
        previousEditStatus: claim.editStatus,
        timeElapsedBeforeReassignment: claim.timeElapsed || 0
      }
    });

    // Send URGENT notification to previous editor
    addNotification({
      type: NotificationType.SYSTEM_ALERT,
      title: '⚠️ Claim Force Reassigned',
      message: `Claim ${claim.visitNumber} has been force reassigned to ${targetEditor.name} by ${managerName}. Any unsaved changes have been discarded.`,
      claimId,
      userId: fromEditorId
    });

    // Send URGENT notification to new editor
    addNotification({
      type: NotificationType.CLAIM_ASSIGNED,
      title: '🔴 URGENT: Claim Assigned (Force Reassignment)',
      message: `Claim ${claim.visitNumber} has been urgently assigned to you by ${managerName}. This claim was force reassigned from ${previousEditorName}.`,
      claimId,
      userId: toEditorId
    });

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
          timeElapsed: 0 // Reset timer
        },
        previousEditor: {
          id: fromEditorId,
          name: previousEditorName
        },
        newEditor: {
          id: toEditorId,
          name: targetEditor.name,
          currentQueueCount: updatedTargetEditor.claimsAssigned
        },
        type: ReassignmentType.FORCE,
        wasForced: true,
        notificationsSent: {
          previousEditor: true,
          newEditor: true
        }
      },
      message: `Claim force reassigned from ${previousEditorName} to ${targetEditor.name}. Unsaved changes discarded, saved progress preserved.`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Force reassignment error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred during force reassignment',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Bulk reassignment
 *
 * @param {object} request - BulkReassignRequest
 * @returns {Promise<object>} BulkReassignResponse
 */
export const bulkReassign = async (request) => {
  await simulateDelay(500);

  try {
    const { claimIds, toEditorId, type } = request;

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Process each claim
    for (const claimId of claimIds) {
      const claim = getClaimById(claimId);

      if (!claim) {
        results.push({
          claimId,
          success: false,
          error: 'Claim not found'
        });
        failureCount++;
        continue;
      }

      // Determine reassignment type based on claim status
      const isInProgress = claim.editStatus === EditStatus.IN_PROGRESS;
      const reassignFunc = isInProgress || type === ReassignmentType.FORCE
        ? forceReassign
        : standardReassign;

      try {
        const response = await reassignFunc({
          claimId,
          fromEditorId: claim.assignedTo,
          toEditorId,
          type,
          reason: 'Bulk reassignment'
        });

        if (response.success) {
          results.push({
            claimId,
            success: true
          });
          successCount++;
        } else {
          results.push({
            claimId,
            success: false,
            error: response.message || response.error
          });
          failureCount++;
        }
      } catch (error) {
        results.push({
          claimId,
          success: false,
          error: error.message
        });
        failureCount++;
      }
    }

    return {
      success: true,
      data: {
        successCount,
        failureCount,
        results
      },
      message: `Bulk reassignment completed. ${successCount} succeeded, ${failureCount} failed.`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Bulk reassignment error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred during bulk reassignment',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Auto-redistribute claims (when user deactivated)
 *
 * Uses round-robin algorithm to distribute claims evenly
 *
 * @param {string} deactivatedUserId
 * @returns {Promise<object>} Redistribution result
 */
export const autoRedistributeClaims = async (deactivatedUserId) => {
  await simulateDelay(600);

  try {
    // Get all claims assigned to deactivated user
    const claimsToRedistribute = getClaimsByEditor(deactivatedUserId);

    if (claimsToRedistribute.length === 0) {
      return {
        success: true,
        data: {
          claimsRedistributed: 0,
          redistributionDetails: []
        },
        message: 'No claims to redistribute',
        timestamp: new Date().toISOString()
      };
    }

    // Get active editors sorted by queue count (ascending)
    const activeEditors = getActiveEditors().sort((a, b) => a.claimsAssigned - b.claimsAssigned);

    if (activeEditors.length === 0) {
      return {
        success: false,
        error: 'NO_ACTIVE_EDITORS',
        message: 'No active editors available for redistribution',
        timestamp: new Date().toISOString()
      };
    }

    const redistributionDetails = [];
    const managerId = 'MGR-1000'; // Mock manager ID
    const managerName = 'Dr. Suresh Menon'; // Mock manager name

    // Round-robin distribution
    claimsToRedistribute.forEach((claim, index) => {
      // Cycle through editors
      const targetEditor = activeEditors[index % activeEditors.length];

      // Reassign claim
      reassignClaim(claim.id, deactivatedUserId, targetEditor.id, ReassignmentType.DEACTIVATION, managerId);

      // Create audit entry
      addAuditEntry({
        eventType: AuditEventType.CLAIM_AUTO_REASSIGNED,
        claimId: claim.id,
        userId: targetEditor.id,
        userName: targetEditor.name,
        performedBy: 'SYSTEM',
        performedByName: 'System (Auto-Redistribution)',
        details: {
          previousAssignee: deactivatedUserId,
          newAssignee: targetEditor.id,
          newAssigneeName: targetEditor.name,
          reason: 'User deactivation',
          redistributionMethod: 'round-robin'
        }
      });

      // Notify new editor
      addNotification({
        type: NotificationType.CLAIM_ASSIGNED,
        title: 'Claim Auto-Assigned',
        message: `Claim ${claim.visitNumber} has been assigned to you due to user deactivation`,
        claimId: claim.id,
        userId: targetEditor.id
      });

      redistributionDetails.push({
        claimId: claim.id,
        newAssigneeId: targetEditor.id,
        newAssigneeName: targetEditor.name
      });
    });

    return {
      success: true,
      data: {
        claimsRedistributed: claimsToRedistribute.length,
        redistributionDetails
      },
      message: `${claimsToRedistribute.length} claims redistributed via round-robin`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Auto-redistribution error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred during auto-redistribution',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Validate reassignment eligibility
 *
 * @param {string} claimId
 * @param {string} type - 'STANDARD' or 'FORCE'
 * @returns {Promise<object>} Validation result
 */
export const validateReassignment = async (claimId, type) => {
  await simulateDelay(100);

  try {
    const claim = getClaimById(claimId);

    if (!claim) {
      return {
        success: false,
        canReassign: false,
        reason: 'CLAIM_NOT_FOUND',
        message: 'Claim not found'
      };
    }

    // Standard reassignment validation
    if (type === ReassignmentType.STANDARD) {
      if (claim.editStatus !== EditStatus.PENDING) {
        return {
          success: true,
          canReassign: false,
          requiresForce: true,
          reason: 'CLAIM_IN_PROGRESS',
          message: `Claim is ${claim.editStatus}. Use force reassignment.`,
          claim: {
            id: claim.id,
            editStatus: claim.editStatus,
            assignedTo: claim.assignedToName
          }
        };
      }

      return {
        success: true,
        canReassign: true,
        requiresForce: false,
        message: 'Claim can be reassigned (standard)',
        claim: {
          id: claim.id,
          editStatus: claim.editStatus,
          assignedTo: claim.assignedToName
        }
      };
    }

    // Force reassignment validation
    if (type === ReassignmentType.FORCE) {
      if (claim.editStatus === EditStatus.ADJUDICATED || claim.editStatus === EditStatus.RE_ADJUDICATED) {
        return {
          success: true,
          canReassign: false,
          reason: 'CLAIM_COMPLETED',
          message: 'Claim has been adjudicated and cannot be reassigned. Use re-adjudication instead.',
          claim: {
            id: claim.id,
            editStatus: claim.editStatus
          }
        };
      }

      return {
        success: true,
        canReassign: true,
        requiresForce: true,
        message: 'Claim can be force reassigned',
        claim: {
          id: claim.id,
          editStatus: claim.editStatus,
          assignedTo: claim.assignedToName,
          timeElapsed: claim.timeElapsed
        }
      };
    }

    return {
      success: false,
      canReassign: false,
      reason: 'INVALID_TYPE',
      message: 'Invalid reassignment type'
    };
  } catch (error) {
    console.error('[Mock] Validation error:', error);
    return {
      success: false,
      canReassign: false,
      reason: 'INTERNAL_ERROR',
      message: error.message
    };
  }
};

export default {
  standardReassign,
  forceReassign,
  bulkReassign,
  autoRedistributeClaims,
  validateReassignment
};
