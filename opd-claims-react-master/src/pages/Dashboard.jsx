import PageHeader from '../components/common/PageHeader';
import CapacityViewWidget from '../components/manager/shared/CapacityViewWidget';

/**
 * Dashboard Page
 * Manager dashboard with real-time capacity view and key metrics
 */
const Dashboard = () => {
  return (
    <div>
      {/* Page Header */}
      <PageHeader title="Manager Dashboard" />

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Edit Manager
            </h2>
            <p className="text-sm text-gray-600">
              Monitor your team's capacity, track claim processing progress, and manage editor assignments in real-time.
            </p>
          </div>

          {/* Capacity View Widget */}
          <div>
            <CapacityViewWidget />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/dashboard/edit-management"
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Management</h3>
              </div>
              <p className="text-sm text-gray-600">
                View and manage all claims in the editing pipeline
              </p>
            </a>

            <a
              href="/dashboard/analytics"
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              </div>
              <p className="text-sm text-gray-600">
                View detailed editor performance metrics and trends
              </p>
            </a>

            <a
              href="/dashboard/user-management"
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              </div>
              <p className="text-sm text-gray-600">
                Manage editor accounts, roles, and permissions
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
