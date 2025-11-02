/**
 * Service Factory Pattern
 *
 * Central export point for all Edit Manager services.
 * Automatically switches between mock and real API implementations
 * based on the VITE_USE_MOCK_DATA environment variable.
 *
 * This ensures components never import mock or api services directly,
 * making the switch between mock and real data seamless.
 *
 * Usage in components/Redux:
 * ```javascript
 * import { editManagerService, userManagementService } from '@/services';
 *
 * // Use the service (automatically uses mock or API based on toggle)
 * const response = await editManagerService.reAdjudicateClaim(request);
 * ```
 *
 * To switch data sources:
 * 1. Update .env: VITE_USE_MOCK_DATA=false
 * 2. Refresh page
 * 3. All services now use real API
 *
 * @module services
 */

import { useMockData } from '../config/dataSource';

// Import mock services
import * as editManagerMock from './mock/editManagerMock';
import * as reassignmentMock from './mock/reassignmentMock';
import * as userManagementMock from './mock/userManagementMock';
import * as analyticsMock from './mock/analyticsMock';

// Import API services
import * as editManagerAPI from './api/editManagerAPI';
import * as reassignmentAPI from './api/reassignmentAPI';
import * as userManagementAPI from './api/userManagementAPI';
import * as analyticsAPI from './api/analyticsAPI';

/**
 * Current data source mode
 */
export const DATA_MODE = useMockData() ? 'MOCK' : 'API';

/**
 * Edit Manager Service
 * Handles re-adjudication workflows (F1)
 *
 * Functions:
 * - reAdjudicateClaim(request)
 * - getManagerClaims(params)
 * - getClaimById(claimId)
 * - getActiveEditors()
 */
export const editManagerService = useMockData()
  ? editManagerMock.default
  : editManagerAPI.default;

/**
 * Reassignment Service
 * Handles claim reassignment workflows (F2)
 *
 * Functions:
 * - standardReassign(request)
 * - forceReassign(request)
 * - bulkReassign(request)
 * - autoRedistribute(fromUserId)
 * - getReassignmentHistory(claimId)
 */
export const reassignmentService = useMockData()
  ? reassignmentMock.default
  : reassignmentAPI.default;

/**
 * User Management Service
 * Handles user CRUD operations (F3)
 *
 * Functions:
 * - getUsers(params)
 * - getUserById(userId)
 * - createUser(request)
 * - activateUser(request)
 * - deactivateUser(request)
 * - resetPassword(request)
 * - updateUser(userId, updates)
 */
export const userManagementService = useMockData()
  ? userManagementMock.default
  : userManagementAPI.default;

/**
 * Analytics Service
 * Handles analytics and reporting (F4, F5, F6)
 *
 * Functions:
 * - getEditorAnalytics(request)
 * - getTeamAnalytics(params)
 * - getCapacityView()
 * - getAuditTrail(request)
 * - exportAnalytics(params)
 */
export const analyticsService = useMockData()
  ? analyticsMock.default
  : analyticsAPI.default;

/**
 * Get configuration info (for debugging)
 */
export const getServiceConfig = () => ({
  mode: DATA_MODE,
  isMock: useMockData(),
  services: {
    editManager: editManagerService.constructor.name || 'EditManagerService',
    reassignment: reassignmentService.constructor.name || 'ReassignmentService',
    userManagement: userManagementService.constructor.name || 'UserManagementService',
    analytics: analyticsService.constructor.name || 'AnalyticsService'
  },
  timestamp: new Date().toISOString()
});

/**
 * Log service configuration in development mode
 */
if (import.meta.env.DEV) {
  console.log('[Service Factory] Configuration:', getServiceConfig());
  console.log('[Service Factory] Using', DATA_MODE, 'services');
}

/**
 * Named exports for convenient destructuring
 */
export {
  editManagerService as editManager,
  reassignmentService as reassignment,
  userManagementService as userManagement,
  analyticsService as analytics
};

/**
 * Default export with all services
 */
export default {
  editManager: editManagerService,
  reassignment: reassignmentService,
  userManagement: userManagementService,
  analytics: analyticsService,
  config: getServiceConfig
};
