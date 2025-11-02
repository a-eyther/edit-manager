import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import diagnosisReducer from './slices/diagnosisSlice';
import symptomsReducer from './slices/symptomsSlice';
import claimsReducer from './slices/claimsSlice';
import editManagerReducer from './slices/editManagerSlice';
import reassignmentReducer from './slices/reassignmentSlice';
import usersReducer from './slices/usersSlice';
import analyticsReducer from './slices/analyticsSlice';
import notificationsReducer from './slices/notificationsSlice';

/**
 * Configure Redux store
 * Combines all reducers and applies middleware
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    diagnosis: diagnosisReducer,
    symptoms: symptomsReducer,
    claims: claimsReducer,
    editManager: editManagerReducer,
    reassignment: reassignmentReducer,
    users: usersReducer,
    analytics: analyticsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['auth/login/pending', 'auth/logout/pending'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production', // Enable Redux DevTools in development
});

export default store;
