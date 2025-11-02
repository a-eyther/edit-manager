import { useState } from 'react';
import { Provider } from 'react-redux';
import store from '../../store';
import {
  ReEditButton,
  AssignmentModal,
  ReassignButton,
  ReassignmentModal,
  UserManagementPage,
  EditorAnalyticsPage,
  AuditLogPage,
  CapacityViewWidget,
  NotificationCenter
} from '../../components/manager';
import { EditStatus } from '../../types/api-contracts';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatsCard from '../../components/common/StatsCard';
import ClaimActionMenu from '../../components/common/ClaimActionMenu';
import TimerBadge from '../../components/common/TimerBadge';
import { UserIcon, DocumentIcon, CheckCircleIcon, ClockIcon } from '../../components/icons';

/**
 * Component Showcase Page
 *
 * Demonstrates all 18 components (13 Edit Manager + 5 Common) in one place.
 * This is a test/demo page for verifying component functionality with mock data.
 *
 * Usage:
 * - Add this to App.jsx routing: <Route path="/showcase" element={<ComponentShowcase />} />
 * - Or navigate directly to /showcase in the browser
 */
function ComponentShowcaseInner() {
  // Modal states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showReassignmentModal, setShowReassignmentModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('common');

  // Test data
  const testClaim = {
    id: 'CLM-3001',
    visitNumber: 'VN-13001',
    patientName: 'Test Patient',
    hospitalName: 'Apollo Hospital',
    editStatus: EditStatus.IN_PROGRESS,
    assignedTo: 'EDR-2000',
    assignedToName: 'Priya Sharma',
    lctSubmissionCount: 2
  };

  const tabs = [
    { id: 'common', label: 'Common Components' },
    { id: 'edit-manager', label: 'Edit Manager Core' },
    { id: 'user-management', label: 'User Management' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'audit', label: 'Audit Log' },
    { id: 'shared', label: 'Shared Widgets' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with NotificationCenter */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Edit Manager Component Showcase</h4>
              <p className="text-sm text-gray-600 mt-1">
                All 18 components with mock data integration (13 manager + 5 common)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                Mock Data: ON
              </div>
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Common Components */}
        {selectedTab === 'common' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Common Components (5)
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Highly reusable components used throughout the application
              </p>

              {/* Component 1: DataTable */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. DataTable</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Reusable data table with sorting, pagination, and custom renderers.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Props:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li><code className="bg-white px-1.5 py-0.5 rounded">columns</code> - Array of column definitions with key, header, render, sortable</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">data</code> - Array of data objects</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">rowsPerPage</code> - Number of rows per page (default: 10)</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">onRowClick</code> - Optional callback when row is clicked</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">loading</code> - Loading state boolean</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">onPageSizeChange</code> - Callback for page size changes</li>
                  </ul>
                </div>

                {/* Example 1: Basic Table with Sorting */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Example 1: Basic Table with Sorting</h4>
                  <DataTable
                    columns={[
                      { key: 'id', header: 'Claim ID', sortable: true },
                      { key: 'patient', header: 'Patient', sortable: true },
                      { key: 'amount', header: 'Amount', sortable: true, render: (val) => `₹${val.toLocaleString()}` },
                      {
                        key: 'status',
                        header: 'Status',
                        sortable: false,
                        render: (val) => <StatusBadge status={val} />
                      }
                    ]}
                    data={[
                      { id: 'CLM-001', patient: 'John Doe', amount: 15000, status: 'PENDING' },
                      { id: 'CLM-002', patient: 'Jane Smith', amount: 25000, status: 'IN_PROGRESS' },
                      { id: 'CLM-003', patient: 'Bob Johnson', amount: 8500, status: 'ADJUDICATED' },
                      { id: 'CLM-004', patient: 'Alice Williams', amount: 12000, status: 'APPROVED' },
                      { id: 'CLM-005', patient: 'Charlie Brown', amount: 18500, status: 'REJECTED' }
                    ]}
                    rowsPerPage={5}
                  />
                </div>

                {/* Example 2: Table with Click Handler */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Example 2: Clickable Rows</h4>
                  <DataTable
                    columns={[
                      { key: 'editor', header: 'Editor Name' },
                      { key: 'assigned', header: 'Assigned', render: (val) => val.toString() },
                      { key: 'completed', header: 'Completed', render: (val) => val.toString() }
                    ]}
                    data={[
                      { editor: 'Priya Sharma', assigned: 12, completed: 8 },
                      { editor: 'Rahul Verma', assigned: 15, completed: 10 },
                      { editor: 'Anjali Patel', assigned: 10, completed: 9 }
                    ]}
                    rowsPerPage={3}
                    onRowClick={(row) => alert(`Clicked on: ${row.editor}`)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Click any row to trigger the onClick handler</p>
                </div>
              </div>

              {/* Component 2: StatusBadge */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. StatusBadge</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Status badge with automatic color coding based on status value.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Props:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li><code className="bg-white px-1.5 py-0.5 rounded">status</code> - Status string (auto-normalized to uppercase with underscores)</li>
                  </ul>
                </div>

                {/* Claim Statuses */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Claim Edit Statuses:</h4>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="UNASSIGNED" />
                    <StatusBadge status="PENDING" />
                    <StatusBadge status="IN_PROGRESS" />
                    <StatusBadge status="ADJUDICATED" />
                    <StatusBadge status="EDITED" />
                    <StatusBadge status="AUTOMATED" />
                  </div>
                </div>

                {/* Decision Statuses */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Adjudication Decision Statuses:</h4>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="APPROVED" />
                    <StatusBadge status="REJECTED" />
                    <StatusBadge status="APPROVED_MODIFIED" />
                    <StatusBadge status="DECISION_PENDING" />
                  </div>
                </div>

                {/* Other Statuses */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Other Statuses:</h4>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="OPD" />
                    <StatusBadge status="DENTAL" />
                    <StatusBadge status="OPTICAL" />
                    <StatusBadge status="RESPONSE_SENT" />
                    <StatusBadge status="TAT_EXPIRED" />
                  </div>
                </div>
              </div>

              {/* Component 3: StatsCard */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. StatsCard</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Dashboard statistics card with icon, label, and value. Optionally clickable for navigation.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Props:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li><code className="bg-white px-1.5 py-0.5 rounded">label</code> - Card label/title</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">value</code> - Statistic value (number or string)</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">icon</code> - React icon element</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">iconColor</code> - Tailwind color class for icon</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">onClick</code> - Optional click handler (makes card interactive)</li>
                  </ul>
                </div>

                {/* Examples */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <StatsCard
                    label="Total Claims"
                    value="142"
                    icon={<DocumentIcon />}
                    iconColor="text-blue-600"
                  />
                  <StatsCard
                    label="Active Editors"
                    value="12"
                    icon={<UserIcon />}
                    iconColor="text-green-600"
                  />
                  <StatsCard
                    label="Completed Today"
                    value="28"
                    icon={<CheckCircleIcon />}
                    iconColor="text-purple-600"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <StatsCard
                    label="Pending Assignment"
                    value="15"
                    icon={<ClockIcon />}
                    iconColor="text-orange-600"
                    onClick={() => alert('Navigate to Pending Claims')}
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                    <p className="text-xs text-blue-700">
                      ← Clickable card: Hover to see hover effect and click to trigger navigation
                    </p>
                  </div>
                </div>
              </div>

              {/* Component 4: ClaimActionMenu */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. ClaimActionMenu</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Context menu with status-dependent actions. Displays different options based on claim edit_status.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Props:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li><code className="bg-white px-1.5 py-0.5 rounded">row</code> - Claim object with edit_status, claim_unique_id, assigned_to, etc.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {/* UNASSIGNED State */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-700">UNASSIGNED Claim</h4>
                        <StatusBadge status="UNASSIGNED" />
                      </div>
                      <ClaimActionMenu row={{
                        claim_unique_id: 'CLM-100',
                        edit_status: 'UNASSIGNED',
                        patient_name: 'Test Patient',
                        is_locked: false
                      }} />
                    </div>
                    <p className="text-xs text-gray-500">Actions: Self-Assign & Edit, Assign To, View, Audit Trail</p>
                  </div>

                  {/* PENDING State */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-700">PENDING Claim</h4>
                        <StatusBadge status="PENDING" />
                      </div>
                      <ClaimActionMenu row={{
                        claim_unique_id: 'CLM-101',
                        edit_status: 'PENDING',
                        assigned_to: 'EDR-2000',
                        assigned_to_name: 'Priya Sharma',
                        is_locked: false
                      }} />
                    </div>
                    <p className="text-xs text-gray-500">Actions: Self-Assign & Edit, Reassign To, View, Audit Trail</p>
                  </div>

                  {/* IN_PROGRESS State */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-700">IN_PROGRESS Claim</h4>
                        <StatusBadge status="IN_PROGRESS" />
                      </div>
                      <ClaimActionMenu row={{
                        claim_unique_id: 'CLM-102',
                        edit_status: 'IN_PROGRESS',
                        assigned_to: 'EDR-2001',
                        assigned_to_name: 'Rahul Verma',
                        is_locked: false
                      }} />
                    </div>
                    <p className="text-xs text-gray-500">Actions: Force Reassign (with warning), Self-Assign & Edit, View, Audit Log</p>
                  </div>

                  {/* ADJUDICATED State */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-700">ADJUDICATED Claim</h4>
                        <StatusBadge status="ADJUDICATED" />
                      </div>
                      <ClaimActionMenu row={{
                        claim_unique_id: 'CLM-103',
                        edit_status: 'ADJUDICATED',
                        lct_submission_count: 1,
                        is_locked: false
                      }} />
                    </div>
                    <p className="text-xs text-gray-500">Actions: Re-Edit (checks LCT count), View, Audit Trail</p>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Click the three-dot menu icon on each claim to see status-specific actions.
                    The menu automatically adjusts based on edit_status and shows appropriate workflows.
                  </p>
                </div>
              </div>

              {/* Component 5: TimerBadge */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. TimerBadge</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Display countdown/elapsed time with color-coded status indicator.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Props:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li><code className="bg-white px-1.5 py-0.5 rounded">time</code> - Time string to display (e.g., "2h 30m")</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">status</code> - Status label text</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded">variant</code> - Color variant: 'green', 'orange', 'red' (default: 'green')</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Recently Assigned</h4>
                    <TimerBadge time="0h 45m" status="Elapsed" variant="green" />
                    <p className="text-xs text-gray-500 mt-2">Under 1 hour - Green variant</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">In Progress</h4>
                    <TimerBadge time="3h 20m" status="In Progress" variant="orange" />
                    <p className="text-xs text-gray-500 mt-2">1-24 hours - Orange variant</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Overdue</h4>
                    <TimerBadge time="26h 15m" status="TAT Exceeded" variant="red" />
                    <p className="text-xs text-gray-500 mt-2">Over 24 hours - Red variant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Group 1: Edit Manager Core */}
        {selectedTab === 'edit-manager' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Group 1: Edit Manager Core Components (5)
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Components for re-adjudication and claim reassignment workflows
              </p>

              {/* Component 1: ReEditButton */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. ReEditButton</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Triggers re-adjudication. Disabled at max LCT count (3).
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <ReEditButton
                    claimId={testClaim.id}
                    lctSubmissionCount={1}
                    onReEdit={(id) => alert(`Re-edit triggered for ${id}`)}
                  />
                  <span className="text-sm text-gray-600">Count: 1/3 (Enabled)</span>
                </div>
                <div className="flex items-center gap-4">
                  <ReEditButton
                    claimId={testClaim.id}
                    lctSubmissionCount={3}
                    onReEdit={(id) => alert(`Re-edit triggered for ${id}`)}
                  />
                  <span className="text-sm text-gray-600">Count: 3/3 (Disabled - hover to see tooltip)</span>
                </div>
              </div>

              {/* Component 2: AssignmentModal */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. AssignmentModal</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Assign claims to editors with queue visibility.
                </p>
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Open Assignment Modal
                </button>
                <AssignmentModal
                  isOpen={showAssignmentModal}
                  onClose={() => setShowAssignmentModal(false)}
                  claimId={testClaim.id}
                  onAssign={(editorId, editorName) => {
                    alert(`Assigned to: ${editorName} (${editorId})`);
                    setShowAssignmentModal(false);
                  }}
                />
              </div>

              {/* Component 3: ReassignButton */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. ReassignButton</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Smart button that determines STANDARD vs FORCE reassignment based on claim status.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <ReassignButton
                      claim={{ ...testClaim, editStatus: EditStatus.PENDING }}
                      onReassign={(claim, type) => {
                        alert(`Reassign type: ${type}`);
                        setShowReassignmentModal(true);
                      }}
                    />
                    <span className="text-sm text-gray-600">PENDING claim → Standard reassignment</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <ReassignButton
                      claim={{ ...testClaim, editStatus: EditStatus.IN_PROGRESS }}
                      onReassign={(claim, type) => {
                        alert(`Reassign type: ${type}`);
                        setShowReassignmentModal(true);
                      }}
                    />
                    <span className="text-sm text-gray-600">IN_PROGRESS claim → Force reassignment (orange badge)</span>
                  </div>
                </div>
              </div>

              {/* Components 4 & 5: ReassignmentModal + ForceReassignWarning */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4 & 5. ReassignmentModal + ForceReassignWarning</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Modal for reassignment with optional force workflow and warning dialog.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowReassignmentModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Open Reassignment Modal
                  </button>
                  <p className="text-xs text-gray-500">
                    Try both STANDARD and FORCE types. Force requires reason and shows warning dialog.
                  </p>
                </div>
                <ReassignmentModal
                  isOpen={showReassignmentModal}
                  onClose={() => setShowReassignmentModal(false)}
                  claim={testClaim}
                  type="FORCE"
                  onReassign={(data) => {
                    alert(`Reassignment completed:\n${JSON.stringify(data, null, 2)}`);
                    setShowReassignmentModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Group 2: User Management */}
        {selectedTab === 'user-management' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Group 2: User Management Components (4)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Full user CRUD operations: Create, Activate, Deactivate, Reset Password
              </p>
              <p className="text-xs text-gray-500">
                Components: UserManagementPage (full page), CreateUserModal, DeactivateUserModal, UserListTable
              </p>
            </div>
            <UserManagementPage />
          </div>
        )}

        {/* Group 3: Analytics */}
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Group 3: Editor Analytics (Component 11)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Performance metrics, trends, and quality indicators for individual editors
              </p>
              <p className="text-xs text-gray-500">
                Select an editor and date range to view detailed analytics
              </p>
            </div>
            <EditorAnalyticsPage />
          </div>
        )}

        {/* Group 3: Audit Log */}
        {selectedTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Group 3: Audit Log (Component 12)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Complete system audit trail with filtering and search
              </p>
              <p className="text-xs text-gray-500">
                Track all claim assignments, reassignments, user actions, and system events
              </p>
            </div>
            <AuditLogPage />
          </div>
        )}

        {/* Group 4: Shared Widgets */}
        {selectedTab === 'shared' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Group 4: Shared Components (2)
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Reusable widgets for capacity monitoring and notifications
              </p>

              {/* Component 12: CapacityViewWidget */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">12. CapacityViewWidget</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Real-time editor capacity with auto-refresh (every 30 seconds)
                </p>
                <CapacityViewWidget />
              </div>

              {/* Component 13: NotificationCenter */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">13. NotificationCenter</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Notification dropdown with unread badge (see top-right corner of page)
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The NotificationCenter component is displayed in the page header (top-right).
                    Click the bell icon to see notifications from mock data.
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Shows unread count badge</li>
                    <li>Click to open notification panel</li>
                    <li>Mark individual notifications as read</li>
                    <li>Mark all as read or clear all</li>
                    <li>Color-coded by notification type</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Mock Data</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 60 claims with varying statuses</li>
                <li>• 14 users (10 active editors, 2 managers)</li>
                <li>• Realistic audit trail</li>
                <li>• Pre-seeded notifications</li>
                <li>• All data resets on page refresh</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Component Testing</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• All Redux slices connected</li>
                <li>• Services switch between mock/API</li>
                <li>• Full business logic in mock services</li>
                <li>• No routing required for testing</li>
                <li>• Check console for Redux state</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapped component with Redux Provider
 */
function ComponentShowcase() {
  return (
    <Provider store={store}>
      <ComponentShowcaseInner />
    </Provider>
  );
}

export default ComponentShowcase;
