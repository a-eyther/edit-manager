import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import './index.css'
import App from './App.jsx'
import { displayMockAuthInfo } from './utils/mockAuth'
import { initializeMockData } from './services/mock/mockDatabase'

// Display mock authentication info if enabled
displayMockAuthInfo()

// Initialize mock database if mock data is enabled
if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
  console.log('[Main] Initializing mock database...')
  initializeMockData()
  console.log('[Main] Mock database initialized successfully!')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
