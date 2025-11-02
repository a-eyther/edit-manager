import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import DashboardLayout from './layouts/DashboardLayout'
import EditManagement from './pages/EditManagement/EditManagement'
import PatientClaimInfo from './pages/PatientClaimInfo/PatientClaimInfo'
import ComponentShowcase from './pages/demos/ComponentShowcase'
import UserManagementPage from './components/manager/user-management/UserManagementPage'
import DashboardAnalyticsPage from './components/manager/analytics/DashboardAnalyticsPage'
import AuditLogPage from './components/manager/analytics/AuditLogPage'
import ErrorBoundary from './components/common/ErrorBoundary'
import { selectIsAuthenticated } from './store/slices/authSlice'

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? children : <Navigate to="/" replace />
}

// Public Route Component (redirects to dashboard if already authenticated)
function PublicRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/analytics" replace />}
          />
          <Route
            path="/dashboard/edit-management"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/components-demo"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComponentShowcase />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user-management"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardAnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/audit-log"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AuditLogPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Full-page routes without sidebar */}
          <Route
            path="/claim/:claimId"
            element={
              <ProtectedRoute>
                <PatientClaimInfo />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
