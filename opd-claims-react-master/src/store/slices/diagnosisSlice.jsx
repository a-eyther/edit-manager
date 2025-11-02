import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import claimsService from '../../services/claimsService'

const buildDiagnosisKey = (diagnosis = {}) => {
  const normalizedCode = (diagnosis.code || '').toString().trim().toLowerCase()
  const normalizedText = (diagnosis.text || '').toString().trim().toLowerCase()
  return `${normalizedCode}::${normalizedText}`
}

/**
 * Initial state for diagnosis slice
 */
const initialState = {
  results: [],
  loading: false,
  error: null,
  query: '',
  // selectedDiagnoses: [
  //   { text: 'Acute gastric ulcer with hemorrhage', code: 'K25.1' }
  // ],
    selectedDiagnoses: [],
}

/**
 * Async thunk for searching diagnoses
 */
export const searchDiagnoses = createAsyncThunk(
  'diagnosis/searchDiagnoses',
  async ({ query, page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await claimsService.searchDiagnoses(query, page, pageSize)
      return {
        results: response.results || response || [],
        query,
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search diagnoses'
      )
    }
  }
)

/**
 * Diagnosis slice
 */
const diagnosisSlice = createSlice({
  name: 'diagnosis',
  initialState,
  reducers: {
    // Clear search results
    clearResults: (state) => {
      state.results = []
      state.query = ''
      state.error = null
    },

    // Set search query
    setQuery: (state, action) => {
      state.query = action.payload
    },

    // Add selected diagnosis
    addSelectedDiagnosis: (state, action) => {
      const newKey = buildDiagnosisKey(action.payload)
      const exists = state.selectedDiagnoses.some(
        (diagnosis) => buildDiagnosisKey(diagnosis) === newKey
      )

      if (!exists) {
        state.selectedDiagnoses.push(action.payload)
      }
    },

    // Remove selected diagnosis
    removeSelectedDiagnosis: (state, action) => {
      const removedKey = buildDiagnosisKey(action.payload)
      state.selectedDiagnoses = state.selectedDiagnoses.filter(
        (diagnosis) => buildDiagnosisKey(diagnosis) !== removedKey
      )
    },

    // Clear all selected diagnoses
    clearSelectedDiagnoses: (state) => {
      state.selectedDiagnoses = []
    },

    // Set selected diagnoses (replace all)
    setSelectedDiagnoses: (state, action) => {
      state.selectedDiagnoses = action.payload
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Search diagnoses
    builder
      .addCase(searchDiagnoses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchDiagnoses.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload.results
        state.query = action.payload.query
        state.error = null
      })
      .addCase(searchDiagnoses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.results = []
      })
  },
})

// Export actions
export const {
  clearResults,
  setQuery,
  addSelectedDiagnosis,
  removeSelectedDiagnosis,
  clearSelectedDiagnoses,
  setSelectedDiagnoses,
  clearError,
} = diagnosisSlice.actions

// Selectors
export const selectDiagnosisResults = (state) => state.diagnosis.results
export const selectDiagnosisLoading = (state) => state.diagnosis.loading
export const selectDiagnosisError = (state) => state.diagnosis.error
export const selectDiagnosisQuery = (state) => state.diagnosis.query
export const selectSelectedDiagnoses = (state) => state.diagnosis.selectedDiagnoses

// Export reducer
export default diagnosisSlice.reducer
