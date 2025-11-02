import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services';

/**
 * Initial state for analytics slice
 */
const initialState = {
  editorAnalytics: {
    editorId: null,
    data: null,
    dateRange: {
      startDate: null,
      endDate: null,
    },
  },
  teamAnalytics: null,
  capacityView: null,
  auditTrail: {
    entries: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    filters: {
      eventTypes: [],
      claimId: null,
      userId: null,
      startDate: null,
      endDate: null,
      search: '',
    },
  },
  loading: {
    editor: false,
    team: false,
    capacity: false,
    audit: false,
    export: false,
  },
  error: null,
  exportStatus: null,
};

/**
 * Async thunk to fetch editor analytics
 */
export const fetchEditorAnalytics = createAsyncThunk(
  'analytics/fetchEditorAnalytics',
  async (request, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getEditorAnalytics(request);
      return {
        data: response.data,
        request,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch editor analytics'
      );
    }
  }
);

/**
 * Async thunk to fetch team analytics
 */
export const fetchTeamAnalytics = createAsyncThunk(
  'analytics/fetchTeamAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getTeamAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch team analytics'
      );
    }
  }
);

/**
 * Async thunk to fetch capacity view
 */
export const fetchCapacityView = createAsyncThunk(
  'analytics/fetchCapacityView',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCapacityView();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch capacity view'
      );
    }
  }
);

/**
 * Async thunk to fetch audit trail
 */
export const fetchAuditTrail = createAsyncThunk(
  'analytics/fetchAuditTrail',
  async (request = {}, { getState, rejectWithValue }) => {
    try {
      // Merge request with current filters and pagination
      const state = getState().analytics.auditTrail;
      const requestParams = {
        page: request.page ?? state.pagination.page,
        limit: request.limit ?? state.pagination.limit,
        ...state.filters,
        ...request,
      };

      const response = await analyticsService.getAuditTrail(requestParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch audit trail'
      );
    }
  }
);

/**
 * Async thunk to export analytics data
 */
export const exportAnalytics = createAsyncThunk(
  'analytics/exportAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsService.exportAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to export analytics'
      );
    }
  }
);

/**
 * Analytics slice
 */
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Synchronous actions
    setDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.editorAnalytics.dateRange = { startDate, endDate };
    },
    setAuditFilters: (state, action) => {
      state.auditTrail.filters = { ...state.auditTrail.filters, ...action.payload };
      // Reset to page 1 when filters change
      state.auditTrail.pagination.page = 1;
    },
    clearAuditFilters: (state) => {
      state.auditTrail.filters = {
        eventTypes: [],
        claimId: null,
        userId: null,
        startDate: null,
        endDate: null,
        search: '',
      };
      state.auditTrail.pagination.page = 1;
    },
    setAuditPage: (state, action) => {
      state.auditTrail.pagination.page = action.payload;
    },
    clearEditorAnalytics: (state) => {
      state.editorAnalytics = {
        editorId: null,
        data: null,
        dateRange: {
          startDate: null,
          endDate: null,
        },
      };
    },
    resetError: (state) => {
      state.error = null;
    },
    clearExportStatus: (state) => {
      state.exportStatus = null;
    },
    resetAnalytics: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Editor Analytics
    builder
      .addCase(fetchEditorAnalytics.pending, (state) => {
        state.loading.editor = true;
        state.error = null;
      })
      .addCase(fetchEditorAnalytics.fulfilled, (state, action) => {
        state.loading.editor = false;
        state.editorAnalytics.data = action.payload.data;
        state.editorAnalytics.editorId = action.payload.request.editorId;
        state.editorAnalytics.dateRange = {
          startDate: action.payload.request.startDate,
          endDate: action.payload.request.endDate,
        };
      })
      .addCase(fetchEditorAnalytics.rejected, (state, action) => {
        state.loading.editor = false;
        state.error = action.payload;
        state.editorAnalytics.data = null;
      })

    // Fetch Team Analytics
    builder
      .addCase(fetchTeamAnalytics.pending, (state) => {
        state.loading.team = true;
        state.error = null;
      })
      .addCase(fetchTeamAnalytics.fulfilled, (state, action) => {
        state.loading.team = false;
        state.teamAnalytics = action.payload;
      })
      .addCase(fetchTeamAnalytics.rejected, (state, action) => {
        state.loading.team = false;
        state.error = action.payload;
        state.teamAnalytics = null;
      })

    // Fetch Capacity View
    builder
      .addCase(fetchCapacityView.pending, (state) => {
        state.loading.capacity = true;
        state.error = null;
      })
      .addCase(fetchCapacityView.fulfilled, (state, action) => {
        state.loading.capacity = false;
        state.capacityView = action.payload;
      })
      .addCase(fetchCapacityView.rejected, (state, action) => {
        state.loading.capacity = false;
        state.error = action.payload;
        state.capacityView = null;
      })

    // Fetch Audit Trail
    builder
      .addCase(fetchAuditTrail.pending, (state) => {
        state.loading.audit = true;
        state.error = null;
      })
      .addCase(fetchAuditTrail.fulfilled, (state, action) => {
        state.loading.audit = false;
        state.auditTrail.entries = action.payload.data || action.payload;

        // Update pagination if available
        if (action.payload.pagination) {
          state.auditTrail.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAuditTrail.rejected, (state, action) => {
        state.loading.audit = false;
        state.error = action.payload;
        state.auditTrail.entries = [];
      })

    // Export Analytics
    builder
      .addCase(exportAnalytics.pending, (state) => {
        state.loading.export = true;
        state.error = null;
        state.exportStatus = null;
      })
      .addCase(exportAnalytics.fulfilled, (state, action) => {
        state.loading.export = false;
        state.exportStatus = {
          success: true,
          message: 'Export completed successfully',
          data: action.payload,
        };
      })
      .addCase(exportAnalytics.rejected, (state, action) => {
        state.loading.export = false;
        state.exportStatus = {
          success: false,
          message: action.payload,
        };
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setDateRange,
  setAuditFilters,
  clearAuditFilters,
  setAuditPage,
  clearEditorAnalytics,
  resetError,
  clearExportStatus,
  resetAnalytics,
} = analyticsSlice.actions;

// Selectors
export const selectEditorAnalytics = (state) => state.analytics.editorAnalytics.data;
export const selectEditorAnalyticsEditorId = (state) => state.analytics.editorAnalytics.editorId;
export const selectEditorAnalyticsDateRange = (state) => state.analytics.editorAnalytics.dateRange;
export const selectTeamAnalytics = (state) => state.analytics.teamAnalytics;
export const selectCapacityView = (state) => state.analytics.capacityView;
export const selectAuditTrail = (state) => state.analytics.auditTrail.entries;
export const selectAuditPagination = (state) => state.analytics.auditTrail.pagination;
export const selectAuditFilters = (state) => state.analytics.auditTrail.filters;
export const selectIsLoading = (state) => state.analytics.loading;
export const selectError = (state) => state.analytics.error;
export const selectExportStatus = (state) => state.analytics.exportStatus;

// Compound selectors
export const selectIsEditorAnalyticsLoading = (state) => state.analytics.loading.editor;
export const selectIsTeamAnalyticsLoading = (state) => state.analytics.loading.team;
export const selectIsCapacityLoading = (state) => state.analytics.loading.capacity;
export const selectIsAuditLoading = (state) => state.analytics.loading.audit;
export const selectIsExporting = (state) => state.analytics.loading.export;

// Export reducer
export default analyticsSlice.reducer;
