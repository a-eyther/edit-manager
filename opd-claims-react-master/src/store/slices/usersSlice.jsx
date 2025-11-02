import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userManagementService } from '../../services';

/**
 * Initial state for users slice
 */
const initialState = {
  users: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    role: null, // 'EDITOR' | null (managers filtered at service layer)
    status: null, // 'ACTIVE' | 'INACTIVE' | null
    search: '',
  },
  selectedUser: null,
  modals: {
    createUser: false,
    deactivateUser: false,
  },
  loading: false,
  error: null,
  lastCreatedUser: null,
  lastDeactivationResult: null,
};

/**
 * Async thunk to fetch users with filters
 */
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      // Merge params with current filters and pagination
      const state = getState().users;
      const requestParams = {
        page: params.page ?? state.pagination.page,
        limit: params.limit ?? state.pagination.limit,
        ...state.filters,
        ...params,
      };

      const response = await userManagementService.getUsers(requestParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch users'
      );
    }
  }
);

/**
 * Async thunk to create a new user
 */
export const createUser = createAsyncThunk(
  'users/createUser',
  async (request, { rejectWithValue }) => {
    try {
      const response = await userManagementService.createUser(request);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to create user'
      );
    }
  }
);

/**
 * Async thunk to activate a user
 */
export const activateUser = createAsyncThunk(
  'users/activateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userManagementService.activateUser({ userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to activate user'
      );
    }
  }
);

/**
 * Async thunk to deactivate a user
 */
export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userManagementService.deactivateUser({ userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to deactivate user'
      );
    }
  }
);

/**
 * Async thunk to reset user password
 */
export const resetPassword = createAsyncThunk(
  'users/resetPassword',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userManagementService.resetPassword({ userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password'
      );
    }
  }
);

/**
 * Users slice
 */
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Synchronous actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 when filters change
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {
        role: null,
        status: null,
        search: '',
      };
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    openModal: (state, action) => {
      const modalType = action.payload; // 'createUser' | 'deactivateUser'
      state.modals[modalType] = true;
      state.error = null;
    },
    closeModal: (state, action) => {
      const modalType = action.payload;
      state.modals[modalType] = false;
      state.error = null;
      // Clear selected user when closing deactivate modal
      if (modalType === 'deactivateUser') {
        state.selectedUser = null;
      }
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    resetError: (state) => {
      state.error = null;
    },
    resetUsers: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || action.payload;

        // Update pagination if available
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = [];
      })

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.lastCreatedUser = action.payload;
        // Close modal after successful creation
        state.modals.createUser = false;
        // Add new user to the list
        state.users.unshift(action.payload.user);
        state.pagination.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Activate User
    builder
      .addCase(activateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        // Update user in the list
        const index = state.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        // Update selected user if it's the same
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Deactivate User
    builder
      .addCase(deactivateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.lastDeactivationResult = action.payload;
        const updatedUser = action.payload.user;
        // Update user in the list
        const index = state.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        // Close modal and clear selection
        state.modals.deactivateUser = false;
        state.selectedUser = null;
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  openModal,
  closeModal,
  setSelectedUser,
  clearSelectedUser,
  resetError,
  resetUsers,
} = usersSlice.actions;

// Selectors
export const selectUsers = (state) => state.users.users;
export const selectPagination = (state) => state.users.pagination;
export const selectFilters = (state) => state.users.filters;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectModals = (state) => state.users.modals;
export const selectIsLoading = (state) => state.users.loading;
export const selectError = (state) => state.users.error;
export const selectLastCreatedUser = (state) => state.users.lastCreatedUser;
export const selectLastDeactivationResult = (state) => state.users.lastDeactivationResult;

// Compound selectors
export const selectIsCreateModalOpen = (state) => state.users.modals.createUser;
export const selectIsDeactivateModalOpen = (state) => state.users.modals.deactivateUser;
export const selectHasActiveFilters = (state) => {
  const { role, status, search } = state.users.filters;
  return !!(role || status || search);
};

// Export reducer
export default usersSlice.reducer;
