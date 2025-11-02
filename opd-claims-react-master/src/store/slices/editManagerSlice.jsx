import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { editManagerService } from '../../services';

/**
 * Initial state for edit manager slice
 */
const initialState = {
  managerClaims: [],
  selectedClaim: null,
  activeEditors: [],
  loading: {
    claims: false,
    claim: false,
    reAdjudication: false,
    editors: false,
  },
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

/**
 * Async thunk to fetch manager claims
 */
export const fetchManagerClaims = createAsyncThunk(
  'editManager/fetchClaims',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await editManagerService.getManagerClaims(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch manager claims'
      );
    }
  }
);

/**
 * Async thunk to fetch claim by ID
 */
export const fetchClaimById = createAsyncThunk(
  'editManager/fetchClaimById',
  async (claimId, { rejectWithValue }) => {
    try {
      const response = await editManagerService.getClaimById(claimId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch claim details'
      );
    }
  }
);

/**
 * Async thunk for re-adjudication
 */
export const reAdjudicateClaim = createAsyncThunk(
  'editManager/reAdjudicate',
  async (request, { rejectWithValue }) => {
    try {
      const response = await editManagerService.reAdjudicateClaim(request);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to re-adjudicate claim'
      );
    }
  }
);

/**
 * Async thunk to fetch active editors
 */
export const fetchActiveEditors = createAsyncThunk(
  'editManager/fetchActiveEditors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await editManagerService.getActiveEditors();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch active editors'
      );
    }
  }
);

/**
 * Edit Manager slice
 */
const editManagerSlice = createSlice({
  name: 'editManager',
  initialState,
  reducers: {
    // Synchronous actions
    setSelectedClaim: (state, action) => {
      state.selectedClaim = action.payload;
      state.error = null;
    },
    clearSelectedClaim: (state) => {
      state.selectedClaim = null;
    },
    resetError: (state) => {
      state.error = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetEditManager: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Manager Claims
    builder
      .addCase(fetchManagerClaims.pending, (state) => {
        state.loading.claims = true;
        state.error = null;
      })
      .addCase(fetchManagerClaims.fulfilled, (state, action) => {
        state.loading.claims = false;
        state.managerClaims = action.payload.data || action.payload;

        // Update pagination if available
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchManagerClaims.rejected, (state, action) => {
        state.loading.claims = false;
        state.error = action.payload;
        state.managerClaims = [];
      })

    // Fetch Claim By ID
    builder
      .addCase(fetchClaimById.pending, (state) => {
        state.loading.claim = true;
        state.error = null;
      })
      .addCase(fetchClaimById.fulfilled, (state, action) => {
        state.loading.claim = false;
        state.selectedClaim = action.payload;
      })
      .addCase(fetchClaimById.rejected, (state, action) => {
        state.loading.claim = false;
        state.error = action.payload;
        state.selectedClaim = null;
      })

    // Re-Adjudicate Claim
    builder
      .addCase(reAdjudicateClaim.pending, (state) => {
        state.loading.reAdjudication = true;
        state.error = null;
      })
      .addCase(reAdjudicateClaim.fulfilled, (state, action) => {
        state.loading.reAdjudication = false;

        // Update the claim in the list if it exists
        const updatedClaim = action.payload.claim;
        const index = state.managerClaims.findIndex(c => c.id === updatedClaim.id);
        if (index !== -1) {
          state.managerClaims[index] = updatedClaim;
        }

        // Update selected claim if it's the same
        if (state.selectedClaim?.id === updatedClaim.id) {
          state.selectedClaim = updatedClaim;
        }
      })
      .addCase(reAdjudicateClaim.rejected, (state, action) => {
        state.loading.reAdjudication = false;
        state.error = action.payload;
      })

    // Fetch Active Editors
    builder
      .addCase(fetchActiveEditors.pending, (state) => {
        state.loading.editors = true;
        state.error = null;
      })
      .addCase(fetchActiveEditors.fulfilled, (state, action) => {
        state.loading.editors = false;
        state.activeEditors = action.payload;
      })
      .addCase(fetchActiveEditors.rejected, (state, action) => {
        state.loading.editors = false;
        state.error = action.payload;
        state.activeEditors = [];
      });
  },
});

// Export actions
export const {
  setSelectedClaim,
  clearSelectedClaim,
  resetError,
  setPagination,
  resetEditManager,
} = editManagerSlice.actions;

// Selectors
export const selectManagerClaims = (state) => state.editManager.managerClaims;
export const selectSelectedClaim = (state) => state.editManager.selectedClaim;
export const selectActiveEditors = (state) => state.editManager.activeEditors;
export const selectIsLoading = (state) => state.editManager.loading;
export const selectError = (state) => state.editManager.error;
export const selectPagination = (state) => state.editManager.pagination;

// Compound selectors
export const selectIsClaimsLoading = (state) => state.editManager.loading.claims;
export const selectIsClaimLoading = (state) => state.editManager.loading.claim;
export const selectIsReAdjudicating = (state) => state.editManager.loading.reAdjudication;
export const selectIsEditorsLoading = (state) => state.editManager.loading.editors;

// Export reducer
export default editManagerSlice.reducer;
