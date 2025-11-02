/**
 * Mock Authentication for Development
 * Provides static mock users for frontend development without backend
 */

/**
 * Mock Users Database
 * Add more users as needed for testing different roles/permissions
 */
export const MOCK_USERS = {
  // Admin user
  admin: {
    username: 'admin',
    password: 'admin123',
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@vitraya.com',
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      role: 'Administrator',
      is_superuser: true,
      is_staff: true,
      is_active: true,
    },
    token: 'mock-token-admin-' + Date.now(),
  },

  // Editor user
  editor: {
    username: 'editor',
    password: 'editor123',
    user: {
      id: 2,
      username: 'editor',
      email: 'editor@vitraya.com',
      firstName: 'John',
      lastName: 'Editor',
      fullName: 'John Editor',
      role: 'Claim Editor',
      is_superuser: false,
      is_staff: true,
      is_active: true,
    },
    token: 'mock-token-editor-' + Date.now(),
  },

  // Reviewer user
  reviewer: {
    username: 'reviewer',
    password: 'reviewer123',
    user: {
      id: 3,
      username: 'reviewer',
      email: 'reviewer@vitraya.com',
      firstName: 'Sarah',
      lastName: 'Reviewer',
      fullName: 'Sarah Reviewer',
      role: 'Claim Reviewer',
      is_superuser: false,
      is_staff: true,
      is_active: true,
    },
    token: 'mock-token-reviewer-' + Date.now(),
  },
};

/**
 * Check if credentials match a mock user
 * @param {string} username - Username or email
 * @param {string} password - Password
 * @returns {Object|null} Mock user data or null if no match
 */
export const authenticateMockUser = (username, password) => {
  // Check each mock user
  for (const [key, mockUser] of Object.entries(MOCK_USERS)) {
    const matches =
      (mockUser.username === username || mockUser.user.email === username) &&
      mockUser.password === password;

    if (matches) {
      return {
        token: mockUser.token,
        user: mockUser.user,
        // Mock refresh token
        refresh: 'mock-refresh-token-' + Date.now(),
      };
    }
  }

  return null;
};

/**
 * Check if we should use mock authentication
 * Enable via environment variable or when no API URL is configured
 * @returns {boolean}
 */
export const shouldUseMockAuth = () => {
  // Enable mock auth if VITE_USE_MOCK_AUTH is true
  if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
    return true;
  }

  // Enable mock auth if no backend URL is configured
  if (!import.meta.env.VITE_API_BASE_URL) {
    return true;
  }

  return false;
};

/**
 * Get mock user profile (simulates API call)
 * @param {string} token - Auth token
 * @returns {Promise<Object>} User data
 */
export const getMockUserProfile = async (token) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Find user by token
  for (const mockUser of Object.values(MOCK_USERS)) {
    if (token.includes(mockUser.username)) {
      return { user: mockUser.user };
    }
  }

  throw new Error('Invalid token');
};

/**
 * Mock token verification
 * @param {string} token - Token to verify
 * @returns {Promise<boolean>}
 */
export const verifyMockToken = async (token) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return token && token.startsWith('mock-token-');
};

/**
 * Display mock auth info in console
 */
export const displayMockAuthInfo = () => {
  if (shouldUseMockAuth()) {
    console.log(
      '%c🔐 MOCK AUTHENTICATION ENABLED',
      'background: #4169e1; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold;'
    );
    console.log('%cAvailable Mock Users:', 'font-weight: bold; color: #4169e1;');
    console.table(
      Object.entries(MOCK_USERS).map(([key, user]) => ({
        Role: key.charAt(0).toUpperCase() + key.slice(1),
        Username: user.username,
        Password: user.password,
        Email: user.user.email,
        Name: user.user.fullName,
      }))
    );
    console.log(
      '%cTo disable mock auth, set VITE_USE_MOCK_AUTH=false in .env',
      'color: #666; font-style: italic;'
    );
  }
};
