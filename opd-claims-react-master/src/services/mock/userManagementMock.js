/**
 * User Management Mock Service (F3)
 *
 * Implements CRUD operations for editor/manager accounts.
 * Follows PRD requirements for user lifecycle management.
 */

import {
  UserRole,
  UserStatus,
  AuditEventType,
  NotificationType
} from '../../types/api-contracts';

import {
  getUsers,
  getUserById,
  getUsersByRole,
  createUser as createUserInDb,
  updateUserStatus,
  addAuditEntry,
  addNotification
} from './mockDatabase';

import { autoRedistributeClaims } from './reassignmentMock';

/**
 * Simulate API delay
 */
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate temporary password
 */
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Generate password reset token
 */
const generateResetToken = () => {
  return `RST-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Create new user (F3)
 *
 * Business Rules:
 * - Email must be unique
 * - Auto-generates temporary password
 * - Sends welcome email
 * - Creates audit log entry
 *
 * @param {object} request - CreateUserRequest
 * @returns {Promise<object>} CreateUserResponse
 */
export const createUser = async (request) => {
  await simulateDelay(400);

  try {
    const { email, name, role } = request;

    // Validate required fields
    if (!email || !name || !role) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email, name, and role are required',
        timestamp: new Date().toISOString()
      };
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return {
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Invalid email format',
        timestamp: new Date().toISOString()
      };
    }

    // Validate name length
    if (name.trim().length < 2 || name.trim().length > 100) {
      return {
        success: false,
        error: 'INVALID_NAME',
        message: 'Name must be between 2 and 100 characters',
        timestamp: new Date().toISOString()
      };
    }

    // Validate role
    if (role !== UserRole.EDITOR && role !== UserRole.MANAGER) {
      return {
        success: false,
        error: 'INVALID_ROLE',
        message: 'Role must be EDITOR or MANAGER',
        timestamp: new Date().toISOString()
      };
    }

    // Check email uniqueness
    const existingUsers = getUsers();
    const emailExists = existingUsers.some(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return {
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'A user with this email already exists',
        timestamp: new Date().toISOString()
      };
    }

    // Generate temporary password
    const temporaryPassword = generateTempPassword();

    // Create user in database
    const newUser = createUserInDb({
      email: email.toLowerCase(),
      name: name.trim(),
      role
    });

    // Create audit log entry
    const managerId = 'MGR-1000'; // Mock manager ID
    const managerName = 'Dr. Suresh Menon'; // Mock manager name

    addAuditEntry({
      eventType: AuditEventType.USER_CREATED,
      userId: newUser.id,
      userName: newUser.name,
      performedBy: managerId,
      performedByName: managerName,
      details: {
        email: newUser.email,
        role: newUser.role,
        welcomeEmailSent: true
      }
    });

    // Send welcome notification to new user (simulated)
    addNotification({
      type: NotificationType.USER_ACTIVATED,
      title: 'Welcome to OPD Claims Portal',
      message: `Your account has been created. Please check your email for login credentials.`,
      userId: newUser.id
    });

    // Return successful response
    return {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          status: newUser.status,
          claimsAssigned: newUser.claimsAssigned,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        },
        temporaryPassword,
        welcomeEmailSent: true
      },
      message: `User ${newUser.name} created successfully. Welcome email sent to ${newUser.email}.`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Create user error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred while creating user',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Activate user (F3)
 *
 * Reactivates previously deactivated user
 * Sends password reset link
 *
 * @param {object} request - ActivateUserRequest
 * @returns {Promise<object>} ApiResponse
 */
export const activateUser = async (request) => {
  await simulateDelay(350);

  try {
    const { userId } = request;

    // Validate user exists
    const user = getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      };
    }

    // Check if already active
    if (user.status === UserStatus.ACTIVE) {
      return {
        success: false,
        error: 'ALREADY_ACTIVE',
        message: 'User is already active',
        timestamp: new Date().toISOString()
      };
    }

    // Update user status
    updateUserStatus(userId, UserStatus.ACTIVE);
    const updatedUser = getUserById(userId);

    // Create audit log entry
    const managerId = 'MGR-1000'; // Mock manager ID
    const managerName = 'Dr. Suresh Menon'; // Mock manager name

    addAuditEntry({
      eventType: AuditEventType.USER_ACTIVATED,
      userId: updatedUser.id,
      userName: updatedUser.name,
      performedBy: managerId,
      performedByName: managerName,
      details: {
        previousStatus: UserStatus.INACTIVE,
        newStatus: UserStatus.ACTIVE,
        passwordResetRequired: true
      }
    });

    // Send reactivation notification to user
    addNotification({
      type: NotificationType.USER_ACTIVATED,
      title: 'Account Reactivated',
      message: `Your account has been reactivated. Please check your email for password reset instructions.`,
      userId: updatedUser.id
    });

    // Return successful response
    return {
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          status: updatedUser.status,
          claimsAssigned: updatedUser.claimsAssigned,
          lastLogin: updatedUser.lastLogin,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      },
      message: `User ${updatedUser.name} activated successfully. Reactivation email sent.`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Activate user error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred while activating user',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Deactivate user (F3)
 *
 * Business Rules:
 * - Removes access immediately
 * - Redistributes assigned claims via round-robin
 * - Cannot be deleted (only deactivated)
 * - Creates audit log entries
 *
 * @param {object} request - DeactivateUserRequest
 * @returns {Promise<object>} DeactivateUserResponse
 */
export const deactivateUser = async (request) => {
  await simulateDelay(500);

  try {
    const { userId } = request;

    // Validate user exists
    const user = getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      };
    }

    // Check if already inactive
    if (user.status === UserStatus.INACTIVE) {
      return {
        success: false,
        error: 'ALREADY_INACTIVE',
        message: 'User is already inactive',
        timestamp: new Date().toISOString()
      };
    }

    // Redistribute claims if user is an editor with assigned claims
    let redistributionResult = {
      claimsRedistributed: 0,
      redistributionDetails: []
    };

    if (user.role === UserRole.EDITOR && user.claimsAssigned > 0) {
      const redistribution = await autoRedistributeClaims(userId);
      if (redistribution.success) {
        redistributionResult = redistribution.data;
      }
    }

    // Update user status
    updateUserStatus(userId, UserStatus.INACTIVE);
    const updatedUser = getUserById(userId);

    // Create audit log entry
    const managerId = 'MGR-1000'; // Mock manager ID
    const managerName = 'Dr. Suresh Menon'; // Mock manager name

    addAuditEntry({
      eventType: AuditEventType.USER_DEACTIVATED,
      userId: updatedUser.id,
      userName: updatedUser.name,
      performedBy: managerId,
      performedByName: managerName,
      details: {
        previousStatus: UserStatus.ACTIVE,
        newStatus: UserStatus.INACTIVE,
        claimsRedistributed: redistributionResult.claimsRedistributed,
        redistributionMethod: 'round-robin'
      }
    });

    // Send deactivation notification to user
    addNotification({
      type: NotificationType.USER_DEACTIVATED,
      title: 'Account Deactivated',
      message: `Your account has been deactivated. Contact your manager for more information.`,
      userId: updatedUser.id
    });

    // Return successful response
    return {
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          status: updatedUser.status,
          claimsAssigned: 0, // Now zero after redistribution
          lastLogin: updatedUser.lastLogin,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        },
        claimsRedistributed: redistributionResult.claimsRedistributed,
        redistributionDetails: redistributionResult.redistributionDetails
      },
      message: `User ${updatedUser.name} deactivated successfully. ${redistributionResult.claimsRedistributed} claims redistributed.`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Deactivate user error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred while deactivating user',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Reset password (F3)
 *
 * Generates reset token and sends email
 *
 * @param {object} request - ResetPasswordRequest
 * @returns {Promise<object>} ResetPasswordResponse
 */
export const resetPassword = async (request) => {
  await simulateDelay(300);

  try {
    const { userId } = request;

    // Validate user exists
    const user = getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      };
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Create audit log entry
    const managerId = 'MGR-1000'; // Mock manager ID
    const managerName = 'Dr. Suresh Menon'; // Mock manager name

    addAuditEntry({
      eventType: AuditEventType.PASSWORD_RESET_INITIATED,
      userId: user.id,
      userName: user.name,
      performedBy: managerId,
      performedByName: managerName,
      details: {
        email: user.email,
        resetTokenExpiry: expiresAt.toISOString()
      }
    });

    // Send password reset notification to user
    addNotification({
      type: NotificationType.PASSWORD_RESET,
      title: 'Password Reset Requested',
      message: `A password reset link has been sent to your email. The link will expire in 24 hours.`,
      userId: user.id
    });

    // Return successful response
    return {
      success: true,
      data: {
        emailSent: true,
        resetToken, // Only in mock, not in real API
        expiresAt: expiresAt.toISOString()
      },
      message: `Password reset email sent to ${user.email}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Reset password error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred while resetting password',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get all users with filters
 *
 * @param {object} filters - Optional filters
 * @returns {Promise<object>} Users list
 */
export const getAllUsers = async (filters = {}) => {
  await simulateDelay(250);

  try {
    let users = getUsers();

    // ALWAYS filter out managers - User Management is for editors only
    users = users.filter(u => u.role !== UserRole.MANAGER);

    // Apply role filter (optional, but managers already excluded above)
    if (filters.role && filters.role !== UserRole.MANAGER) {
      users = getUsersByRole(filters.role);
      // Re-apply manager exclusion in case getUsersByRole returns managers
      users = users.filter(u => u.role !== UserRole.MANAGER);
    }

    // Apply status filter
    if (filters.status) {
      users = users.filter(u => u.status === filters.status);
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by name (default)
    users.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total: users.length,
          totalPages: Math.ceil(users.length / limit)
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Get users error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred while fetching users',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get user by ID
 *
 * @param {string} userId
 * @returns {Promise<object>} User details
 */
export const getUser = async (userId) => {
  await simulateDelay(150);

  try {
    const user = getUserById(userId);

    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Get user error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred while fetching user',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Update user details (limited fields)
 *
 * Note: Role cannot be changed after creation
 *
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<object>} Updated user
 */
export const updateUser = async (userId, updates) => {
  await simulateDelay(300);

  try {
    const user = getUserById(userId);

    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      };
    }

    // Only allow updating name and email
    if (updates.name) {
      user.name = updates.name.trim();
    }

    if (updates.email) {
      // Check email uniqueness
      const existingUsers = getUsers();
      const emailExists = existingUsers.some(
        u => u.id !== userId && u.email.toLowerCase() === updates.email.toLowerCase()
      );

      if (emailExists) {
        return {
          success: false,
          error: 'EMAIL_EXISTS',
          message: 'A user with this email already exists',
          timestamp: new Date().toISOString()
        };
      }

      user.email = updates.email.toLowerCase();
    }

    user.updatedAt = new Date().toISOString();

    return {
      success: true,
      data: user,
      message: 'User updated successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Update user error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred while updating user',
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  createUser,
  activateUser,
  deactivateUser,
  resetPassword,
  getAllUsers,
  getUsers: getAllUsers, // Alias for Redux slice compatibility
  getUser,
  getUserById: getUser, // Alias for consistency
  updateUser
};
