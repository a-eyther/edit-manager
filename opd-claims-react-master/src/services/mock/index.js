/**
 * Mock Services Entry Point
 *
 * Exports all mock service functions for Edit Manager features.
 * Use this as a single import point for all mock APIs.
 *
 * Usage:
 * ```javascript
 * import { reAdjudicateClaim, standardReassign, createUser } from '@/services/mock';
 * ```
 */

// Database
export {
  initializeMockData,
  getClaims,
  getClaimById,
  getClaimsByEditor,
  getUsers,
  getUserById,
  getUsersByRole,
  getActiveEditors,
  getAssignments,
  getAuditLog,
  getNotifications,
  createUser as createUserInDb,
  updateUserStatus,
  reassignClaim as reassignClaimInDb,
  updateClaim,
  addAuditEntry,
  addNotification,
  markNotificationRead
} from './mockDatabase';

// Edit Manager (Re-Adjudication)
export {
  reAdjudicateClaim,
  canReAdjudicate,
  getAvailableEditorsForReAdjudication,
  getReAdjudicationHistory
} from './editManagerMock';

// Reassignment
export {
  standardReassign,
  forceReassign,
  bulkReassign,
  autoRedistributeClaims,
  validateReassignment
} from './reassignmentMock';

// User Management
export {
  createUser,
  activateUser,
  deactivateUser,
  resetPassword,
  getAllUsers,
  getUser,
  updateUser
} from './userManagementMock';

// Analytics
export {
  getEditorAnalytics,
  getTeamAnalytics,
  getCapacityView,
  exportEditorReport,
  getAuditTrail
} from './analyticsMock';

// Re-export default objects for convenience
export { default as mockDatabase } from './mockDatabase';
export { default as editManagerMock } from './editManagerMock';
export { default as reassignmentMock } from './reassignmentMock';
export { default as userManagementMock } from './userManagementMock';
export { default as analyticsMock } from './analyticsMock';
