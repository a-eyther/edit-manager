/**
 * Edit Manager Components - Central Export
 *
 * This file provides convenient imports for all Edit Manager components.
 * Import individual components or groups as needed.
 *
 * @example
 * // Import individual component
 * import { ReEditButton } from '@/components/manager';
 *
 * // Import group
 * import { UserManagementPage, CreateUserModal } from '@/components/manager';
 *
 * // Import all
 * import * as ManagerComponents from '@/components/manager';
 */

// Import all components (for both named exports and grouped objects)
import ReEditButtonComponent from './edit-manager/ReEditButton';
import AssignmentModalComponent from './edit-manager/AssignmentModal';
import ReassignButtonComponent from './edit-manager/ReassignButton';
import ReassignmentModalComponent from './edit-manager/ReassignmentModal';
import ForceReassignWarningComponent from './edit-manager/ForceReassignWarning';
import UserManagementPageComponent from './user-management/UserManagementPage';
import CreateUserModalComponent from './user-management/CreateUserModal';
import DeactivateUserModalComponent from './user-management/DeactivateUserModal';
import UserListTableComponent from './user-management/UserListTable';
import EditorAnalyticsPageComponent from './analytics/EditorAnalyticsPage';
import AuditLogPageComponent from './analytics/AuditLogPage';
import CapacityViewWidgetComponent from './shared/CapacityViewWidget';
import NotificationCenterComponent from './shared/NotificationCenter';

// Group 1: Edit Manager Core
export { ReEditButtonComponent as ReEditButton };
export { AssignmentModalComponent as AssignmentModal };
export { ReassignButtonComponent as ReassignButton };
export { ReassignmentModalComponent as ReassignmentModal };
export { ForceReassignWarningComponent as ForceReassignWarning };

// Group 2: User Management
export { UserManagementPageComponent as UserManagementPage };
export { CreateUserModalComponent as CreateUserModal };
export { DeactivateUserModalComponent as DeactivateUserModal };
export { UserListTableComponent as UserListTable };

// Group 3: Analytics & Audit
export { EditorAnalyticsPageComponent as EditorAnalyticsPage };
export { AuditLogPageComponent as AuditLogPage };

// Group 4: Supporting Components
export { CapacityViewWidgetComponent as CapacityViewWidget };
export { NotificationCenterComponent as NotificationCenter };

/**
 * Grouped exports for convenience
 */
export const EditManagerComponents = {
  ReEditButton: ReEditButtonComponent,
  AssignmentModal: AssignmentModalComponent,
  ReassignButton: ReassignButtonComponent,
  ReassignmentModal: ReassignmentModalComponent,
  ForceReassignWarning: ForceReassignWarningComponent,
};

export const UserManagementComponents = {
  UserManagementPage: UserManagementPageComponent,
  CreateUserModal: CreateUserModalComponent,
  DeactivateUserModal: DeactivateUserModalComponent,
  UserListTable: UserListTableComponent,
};

export const AnalyticsComponents = {
  EditorAnalyticsPage: EditorAnalyticsPageComponent,
  AuditLogPage: AuditLogPageComponent,
};

export const SharedComponents = {
  CapacityViewWidget: CapacityViewWidgetComponent,
  NotificationCenter: NotificationCenterComponent,
};
