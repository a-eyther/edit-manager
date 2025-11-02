/**
 * Data Source Configuration
 *
 * Controls whether the application uses mock data or real backend API.
 * Toggle via environment variable VITE_USE_MOCK_DATA.
 *
 * Usage:
 * - In components/services: import { useMockData } from '../config/dataSource'
 * - Check: if (useMockData()) { ... }
 *
 * Configuration:
 * - Development (.env.development): VITE_USE_MOCK_DATA=true
 * - Production (.env.production): VITE_USE_MOCK_DATA=false
 */

/**
 * Current data source mode: 'mock' or 'api'
 * @type {'mock' | 'api'}
 */
export const DATA_SOURCE = import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'mock' : 'api';

/**
 * Check if application should use mock data
 * @returns {boolean} True if mock data enabled, false if using real API
 */
export const useMockData = () => DATA_SOURCE === 'mock';

/**
 * Get current data source configuration
 * @returns {object} Data source config details
 */
export const getDataSourceConfig = () => ({
  source: DATA_SOURCE,
  isMock: useMockData(),
  envVariable: import.meta.env.VITE_USE_MOCK_DATA,
  timestamp: new Date().toISOString()
});

/**
 * Log data source configuration (development only)
 */
if (import.meta.env.DEV) {
  console.log('[Data Source Config]', getDataSourceConfig());
}

export default {
  DATA_SOURCE,
  useMockData,
  getDataSourceConfig
};
