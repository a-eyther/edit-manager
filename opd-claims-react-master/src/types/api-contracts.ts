/**
 * API Contract Definitions for Edit Manager Features
 *
 * These TypeScript interfaces define the structure of all API requests and responses
 * for Edit Manager functionality. Both mock services and real API implementations
 * MUST conform to these contracts.
 *
 * Features covered:
 * - F1: Re-Adjudication
 * - F2: Claim Reassignment
 * - F3: User Management
 * - F4: Analytics
 * - F5: Audit Trail
 * - F8: Notifications
 */

// ==================== ENUMS ====================

/**
 * User roles in the system
 */
export enum UserRole {
  EDITOR = 'EDITOR',
  MANAGER = 'MANAGER'
}

/**
 * User account status
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

/**
 * Claim edit status throughout workflow
 */
export enum EditStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  ADJUDICATED = 'ADJUDICATED',
  RE_ADJUDICATED = 'RE_ADJUDICATED',
  AUTOMATED = 'AUTOMATED'
}

/**
 * Reassignment reason/type
 */
export enum ReassignmentType {
  STANDARD = 'STANDARD',      // Not started claim
  FORCE = 'FORCE',            // In-progress claim
  DEACTIVATION = 'DEACTIVATION'  // User deactivated
}

/**
 * Audit event types
 */
export enum AuditEventType {
  AI_ADJUDICATION = 'AI_ADJUDICATION',
  CLAIM_ASSIGNED = 'CLAIM_ASSIGNED',
  CLAIM_REASSIGNED = 'CLAIM_REASSIGNED',
  CLAIM_FORCE_REASSIGNED = 'CLAIM_FORCE_REASSIGNED',
  CLAIM_AUTO_REASSIGNED = 'CLAIM_AUTO_REASSIGNED',
  CLAIM_ADJUDICATED = 'CLAIM_ADJUDICATED',
  CLAIM_RE_ADJUDICATED = 'CLAIM_RE_ADJUDICATED',
  USER_CREATED = 'USER_CREATED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  PASSWORD_RESET_INITIATED = 'PASSWORD_RESET_INITIATED'
}

/**
 * Notification types
 */
export enum NotificationType {
  CLAIM_ASSIGNED = 'CLAIM_ASSIGNED',
  CLAIM_REASSIGNED = 'CLAIM_REASSIGNED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

// ==================== BASE TYPES ====================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ==================== USER TYPES ====================

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  claimsAssigned: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create user request
 */
export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Create user response
 */
export interface CreateUserResponse {
  user: User;
  temporaryPassword: string;
  welcomeEmailSent: boolean;
}

/**
 * Activate user request
 */
export interface ActivateUserRequest {
  userId: string;
}

/**
 * Deactivate user request
 */
export interface DeactivateUserRequest {
  userId: string;
}

/**
 * Deactivate user response
 */
export interface DeactivateUserResponse {
  user: User;
  claimsRedistributed: number;
  redistributionDetails: Array<{
    claimId: string;
    newAssigneeId: string;
    newAssigneeName: string;
  }>;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  userId: string;
}

/**
 * Reset password response
 */
export interface ResetPasswordResponse {
  emailSent: boolean;
  resetToken: string;  // Only in mock, not in real API
  expiresAt: string;
}

// ==================== CLAIM TYPES ====================

/**
 * Simplified claim entity for manager views
 */
export interface ManagerClaim {
  id: string;
  visitNumber: string;
  patientName: string;
  hospitalName: string;
  editStatus: EditStatus;
  assignedTo?: string;
  assignedToName?: string;
  lctSubmissionCount: number;
  requestAmount: number;
  approvedAmount?: number;
  createdAt: string;
  updatedAt: string;
  timeElapsed?: number;  // Minutes since assignment
}

// ==================== RE-ADJUDICATION TYPES (F1) ====================

/**
 * Re-adjudication request
 */
export interface ReAdjudicateRequest {
  claimId: string;
  adjudicationData: any;  // Full adjudication payload (same structure as regular adjudication)
  assignToEditorId: string;
  notes?: string;
}

/**
 * Re-adjudication response
 */
export interface ReAdjudicateResponse {
  claim: ManagerClaim;
  lctSubmissionCount: number;
  maxReached: boolean;  // True if count = 3
  assignedEditor: {
    id: string;
    name: string;
    email: string;
  };
  notificationSent: boolean;
}

// ==================== REASSIGNMENT TYPES (F2) ====================

/**
 * Standard reassignment request
 */
export interface ReassignClaimRequest {
  claimId: string;
  fromEditorId: string;
  toEditorId: string;
  type: ReassignmentType;
  reason?: string;
}

/**
 * Bulk reassignment request
 */
export interface BulkReassignRequest {
  claimIds: string[];
  toEditorId: string;
  type: ReassignmentType;
}

/**
 * Reassignment response
 */
export interface ReassignClaimResponse {
  claim: ManagerClaim;
  previousEditor: {
    id: string;
    name: string;
  };
  newEditor: {
    id: string;
    name: string;
    currentQueueCount: number;
  };
  type: ReassignmentType;
  wasForced: boolean;
  notificationsSent: {
    previousEditor: boolean;
    newEditor: boolean;
  };
}

/**
 * Bulk reassignment response
 */
export interface BulkReassignResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    claimId: string;
    success: boolean;
    error?: string;
  }>;
}

// ==================== ANALYTICS TYPES (F4) ====================

/**
 * Editor analytics request parameters
 */
export interface EditorAnalyticsRequest {
  editorId: string;
  startDate: string;  // ISO 8601 date
  endDate: string;    // ISO 8601 date
}

/**
 * Key metrics for editor performance
 */
export interface EditorKeyMetrics {
  claimsAssigned: number;
  claimsAdjudicated: number;
  claimsPending: number;
  claimsQueried: number;
}

/**
 * Adjudication outcome breakdown
 */
export interface AdjudicationOutcomes {
  approved: number;
  rejected: number;
  partiallyApproved: number;
}

/**
 * Quality indicators
 */
export interface QualityIndicators {
  managerReEdits: number;
  vettingApproved: number;
  vettingRejected: number;
  vettingPartial: number;
  reassignmentCount: number;
}

/**
 * Time-series data point for trends
 */
export interface TimeSeriesDataPoint {
  date: string;  // YYYY-MM-DD
  value: number;
}

/**
 * Performance trend data
 */
export interface PerformanceTrends {
  dailyAdjudications: TimeSeriesDataPoint[];
  approvalRate: TimeSeriesDataPoint[];
  avgProcessingTime: TimeSeriesDataPoint[];  // Minutes
}

/**
 * Recent claim for analytics view
 */
export interface RecentClaim {
  id: string;
  visitNumber: string;
  patientName: string;
  editStatus: EditStatus;
  outcome?: 'APPROVED' | 'REJECTED' | 'PARTIAL';
  adjudicatedAt?: string;
}

/**
 * Complete editor analytics response
 */
export interface EditorAnalyticsResponse {
  editor: {
    id: string;
    name: string;
    email: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  keyMetrics: EditorKeyMetrics;
  outcomes: AdjudicationOutcomes;
  qualityIndicators: QualityIndicators;
  trends: PerformanceTrends;
  recentClaims: RecentClaim[];
  averageProcessingTime: number;  // Minutes
  productivityScore: number;  // 0-100
}

// ==================== CAPACITY VIEW TYPES (F6) ====================

/**
 * Real-time editor capacity info
 */
export interface EditorCapacity {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  claimsAssigned: number;
  claimsInProgress: number;
  claimsPending: number;
  capacityPercentage: number;  // 0-100
  lastActivity?: string;
}

/**
 * System-wide capacity response
 */
export interface CapacityViewResponse {
  totalEditors: number;
  activeEditors: number;
  totalClaims: number;
  averageQueueSize: number;
  editors: EditorCapacity[];
  lastUpdated: string;
}

// ==================== AUDIT TRAIL TYPES (F5) ====================

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  eventType: AuditEventType;
  claimId?: string;
  userId?: string;
  userName?: string;
  performedBy: string;  // User ID who performed action
  performedByName: string;
  timestamp: string;
  details: Record<string, any>;
  ipAddress?: string;
}

/**
 * Audit log filters
 */
export interface AuditLogFilters {
  eventTypes?: AuditEventType[];
  claimId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Audit log request
 */
export interface AuditLogRequest extends AuditLogFilters {
  page?: number;
  limit?: number;
}

// ==================== NOTIFICATION TYPES (F8) ====================

/**
 * In-app notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  claimId?: string;
  userId?: string;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  types: NotificationType[];
}

// ==================== ERROR TYPES ====================

/**
 * API error details
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ==================== EXPORT ALL ====================

export type {
  // Response wrappers
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,

  // Users
  User,
  CreateUserRequest,
  CreateUserResponse,
  ActivateUserRequest,
  DeactivateUserRequest,
  DeactivateUserResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,

  // Claims
  ManagerClaim,

  // Re-adjudication
  ReAdjudicateRequest,
  ReAdjudicateResponse,

  // Reassignment
  ReassignClaimRequest,
  BulkReassignRequest,
  ReassignClaimResponse,
  BulkReassignResponse,

  // Analytics
  EditorAnalyticsRequest,
  EditorAnalyticsResponse,
  EditorKeyMetrics,
  AdjudicationOutcomes,
  QualityIndicators,
  PerformanceTrends,
  TimeSeriesDataPoint,
  RecentClaim,

  // Capacity
  EditorCapacity,
  CapacityViewResponse,

  // Audit
  AuditLogEntry,
  AuditLogFilters,
  AuditLogRequest,

  // Notifications
  Notification,
  NotificationPreferences,

  // Errors
  ApiError,
  ValidationError
};
