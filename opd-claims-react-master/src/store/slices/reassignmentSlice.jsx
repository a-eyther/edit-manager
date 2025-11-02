import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reassignmentService } from '../../services';

/**
 * Initial state for reassignment slice
 */
const initialState = {
  reassignmentModal: {
    isOpen: false,
    claimId: null,
    currentEditor: null,
    type: null, // 'STANDARD' or 'FORCE'
  },
  bulkSelection: [],
  loading: false,
  error: null,
  lastReassignment: null,
};

/**
 * Async thunk for standard reassignment
 */
export const standardReassign = createAsyncThunk(
  'reassignment/standard',
  async (request, { rejectWithValue }) => {
    try {
      const response = await reassignmentService.standardReassign(request);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to reassign claim'
      );
    }
  }
);

/**
 * Async thunk for force reassignment
 */
export const forceReassign = createAsyncThunk(
  'reassignment/force',
  async (request, { rejectWithValue }) => {
    try {
      const response = await reassignmentService.forceReassign(request);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to force reassign claim'
      );
    }
  }
);

/**
 * Async thunk for bulk reassignment
 */
export const bulkReassign = createAsyncThunk(
  'reassignment/bulk',
  async (request, { rejectWithValue }) => {
    try {
      const response = await reassignmentService.bulkReassign(request);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to bulk reassign claims'
      );
    }
  }
);

/**
 * Reassignment slice
 */
const reassignmentSlice = createSlice({
  name: 'reassignment',
  initialState,
  reducers: {
    // Synchronous actions
    openReassignmentModal: (state, action) => {
      const { claim, type } = action.payload;
      state.reassignmentModal = {
        isOpen: true,
        claimId: claim.id,
        currentEditor: {
          id: claim.assignedTo,
          name: claim.assignedToName,
        },
        type: type || 'STANDARD',
      };
      state.error = null;
    },
    closeReassignmentModal: (state) => {
      state.reassignmentModal = {
        isOpen: false,
        claimId: null,
        currentEditor: null,
        type: null,
      };
      state.error = null;
    },
    toggleBulkSelection: (state, action) => {
      const claimId = action.payload;
      const index = state.bulkSelection.indexOf(claimId);

      if (index === -1) {
        // Add to selection
        state.bulkSelection.push(claimId);
      } else {
        // Remove from selection
        state.bulkSelection.splice(index, 1);
      }
    },
    selectAllClaims: (state, action) => {
      state.bulkSelection = action.payload;
    },
    clearBulkSelection: (state) => {
      state.bulkSelection = [];
    },
    resetError: (state) => {
      state.error = null;
    },
    resetReassignment: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Standard Reassign
    builder
      .addCase(standardReassign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(standardReassign.fulfilled, (state, action) => {
        state.loading = false;
        state.lastReassignment = action.payload;
        // Close modal after successful reassignment
        state.reassignmentModal = {
          isOpen: false,
          claimId: null,
          currentEditor: null,
          type: null,
        };
      })
      .addCase(standardReassign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Force Reassign
    builder
      .addCase(forceReassign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forceReassign.fulfilled, (state, action) => {
        state.loading = false;
        state.lastReassignment = action.payload;
        // Close modal after successful reassignment
        state.reassignmentModal = {
          isOpen: false,
          claimId: null,
          currentEditor: null,
          type: null,
        };
      })
      .addCase(forceReassign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Bulk Reassign
    builder
      .addCase(bulkReassign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkReassign.fulfilled, (state, action) => {
        state.loading = false;
        state.lastReassignment = action.payload;
        // Clear bulk selection after successful bulk reassignment
        state.bulkSelection = [];
      })
      .addCase(bulkReassign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  openReassignmentModal,
  closeReassignmentModal,
  toggleBulkSelection,
  selectAllClaims,
  clearBulkSelection,
  resetError,
  resetReassignment,
} = reassignmentSlice.actions;

// Selectors
export const selectReassignmentModal = (state) => state.reassignment.reassignmentModal;
export const selectBulkSelection = (state) => state.reassignment.bulkSelection;
export const selectIsBulkMode = (state) => state.reassignment.bulkSelection.length > 0;
export const selectIsLoading = (state) => state.reassignment.loading;
export const selectError = (state) => state.reassignment.error;
export const selectLastReassignment = (state) => state.reassignment.lastReassignment;

// Helper selectors
export const selectIsClaimSelected = (claimId) => (state) =>
  state.reassignment.bulkSelection.includes(claimId);
export const selectBulkSelectionCount = (state) => state.reassignment.bulkSelection.length;

// Export reducer
export default reassignmentSlice.reducer;
