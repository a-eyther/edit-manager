# Component Showcase - Implementation Examples

This document provides code examples and patterns for adding missing components to the showcase.

---

## Phase 1: Essential UI Components

### 1. DataTable Showcase Section

**Location:** Add to "Edit Manager Core" tab or create new "UI Components" tab

**Code Example:**
```jsx
{/* DataTable Showcase */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">DataTable Examples</h3>
  <p className="text-sm text-gray-600 mb-4">
    Flexible table component with sorting, pagination, and custom rendering
  </p>

  {/* Example 1: Simple Client-Side Table */}
  <div className="mb-8 bg-gray-50 p-4 rounded-lg">
    <h4 className="text-sm font-semibold text-gray-900 mb-3">Example 1: Basic Table</h4>
    <DataTable
      columns={[
        { key: 'id', header: 'Claim ID', sortable: true },
        { key: 'patientName', header: 'Patient Name', sortable: true },
        { 
          key: 'editStatus', 
          header: 'Status',
          render: (status) => <StatusBadge status={status} />
        },
        { 
          key: 'assignedToName', 
          header: 'Assigned To',
          sortable: true
        }
      ]}
      data={testClaims.slice(0, 10)}
      rowsPerPage={5}
      onRowClick={(claim) => alert(`Clicked claim: ${claim.id}`)}
    />
  </div>

  {/* Example 2: Server-Side Pagination */}
  <div className="bg-gray-50 p-4 rounded-lg">
    <h4 className="text-sm font-semibold text-gray-900 mb-3">Example 2: Server-Side Pagination</h4>
    <p className="text-xs text-gray-600 mb-3">
      With onPageChange callback for API integration
    </p>
    <DataTable
      columns={[
        { key: 'id', header: 'ID' },
        { key: 'patientName', header: 'Patient' },
        { key: 'editStatus', header: 'Status' }
      ]}
      data={testClaims.slice(0, 25)}
      rowsPerPage={10}
      currentPage={1}
      totalPages={3}
      onPageChange={(page) => alert(`Page: ${page}`)}
      onPageSizeChange={(size) => alert(`Size: ${size}`)}
    />
  </div>
</div>
```

**Props to Demonstrate:**
- `columns` with sortable, custom render
- `data` with mock claims
- `rowsPerPage` options (10, 25, 50, 100)
- `onRowClick` callback
- Server vs client-side pagination

---

### 2. StatusBadge Showcase Section

**Code Example:**
```jsx
{/* StatusBadge Examples */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">StatusBadge Variants</h3>
  <p className="text-sm text-gray-600 mb-4">
    Color-coded status badges for consistent status display across the application
  </p>

  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    {[
      'APPROVED',
      'REJECTED',
      'PENDING',
      'IN_PROGRESS',
      'ADJUDICATED',
      'RE_ADJUDICATED',
      'EDITED',
      'UNASSIGNED',
      'APPROVED_MODIFIED',
      'TAT_EXPIRED',
      'AUTOMATED',
      'RESPONSE_SENT'
    ].map((status) => (
      <div key={status} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <StatusBadge status={status} />
        <span className="text-xs text-gray-600">{status}</span>
      </div>
    ))}
  </div>
</div>
```

**Status Types to Show:**
- APPROVED (green)
- REJECTED (red)
- PENDING (yellow)
- IN_PROGRESS (blue)
- ADJUDICATED (green)
- RE_ADJUDICATED (yellow)
- UNASSIGNED (gray)
- TAT_EXPIRED (red)
- And more...

---

### 3. StatsCard Showcase Section

**Code Example:**
```jsx
import { 
  BarChart3, ClipboardList, CheckCircle, AlertCircle 
} from 'lucide-react';

{/* StatsCard Examples */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">StatsCard Examples</h3>
  <p className="text-sm text-gray-600 mb-4">
    Display KPIs and metrics with icons and custom colors
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatsCard
      label="Total Claims"
      value={testClaims.length}
      icon={<ClipboardList className="w-5 h-5" />}
      iconColor="text-blue-600"
      onClick={() => alert('Navigate to claims')}
    />
    <StatsCard
      label="Approved"
      value={testClaims.filter(c => c.editStatus === 'ADJUDICATED').length}
      icon={<CheckCircle className="w-5 h-5" />}
      iconColor="text-green-600"
    />
    <StatsCard
      label="Pending"
      value={testClaims.filter(c => c.editStatus === 'PENDING').length}
      icon={<AlertCircle className="w-5 h-5" />}
      iconColor="text-yellow-600"
    />
    <StatsCard
      label="In Progress"
      value={testClaims.filter(c => c.editStatus === 'IN_PROGRESS').length}
      icon={<BarChart3 className="w-5 h-5" />}
      iconColor="text-purple-600"
    />
  </div>

  {/* Example with onClick handler */}
  <div className="mt-6">
    <p className="text-xs text-gray-600 mb-2">Clickable Cards:</p>
    <StatsCard
      label="View Analytics"
      value="6 of 10"
      icon={<BarChart3 className="w-5 h-5" />}
      iconColor="text-primary-600"
      onClick={() => alert('Navigate to analytics page')}
    />
  </div>
</div>
```

**Features to Show:**
- Different icons and colors
- Large value display
- Clickable variant with hover effect
- Various metric calculations

---

### 4. ConfirmationModal Showcase Section

**Code Example:**
```jsx
const [confirmModalOpen, setConfirmModalOpen] = useState({
  default: false,
  danger: false,
  warning: false
});

{/* ConfirmationModal Examples */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">ConfirmationModal Variants</h3>
  <p className="text-sm text-gray-600 mb-4">
    Reusable confirmation dialog with three visual variants
  </p>

  <div className="space-y-3">
    {/* Default Variant */}
    <button
      onClick={() => setConfirmModalOpen({ ...confirmModalOpen, default: true })}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
    >
      Open Default Confirmation
    </button>
    <ConfirmationModal
      isOpen={confirmModalOpen.default}
      variant="default"
      title="Confirm Action"
      message="Are you sure you want to proceed with this action?"
      confirmText="Proceed"
      cancelText="Cancel"
      onConfirm={() => {
        alert('Action confirmed!');
        setConfirmModalOpen({ ...confirmModalOpen, default: false });
      }}
      onClose={() => setConfirmModalOpen({ ...confirmModalOpen, default: false })}
    />

    {/* Danger Variant */}
    <button
      onClick={() => setConfirmModalOpen({ ...confirmModalOpen, danger: true })}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
    >
      Open Danger Confirmation
    </button>
    <ConfirmationModal
      isOpen={confirmModalOpen.danger}
      variant="danger"
      title="Delete User"
      message="This action cannot be undone. Are you sure?"
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={() => {
        alert('User deleted!');
        setConfirmModalOpen({ ...confirmModalOpen, danger: false });
      }}
      onClose={() => setConfirmModalOpen({ ...confirmModalOpen, danger: false })}
    />

    {/* Warning Variant */}
    <button
      onClick={() => setConfirmModalOpen({ ...confirmModalOpen, warning: true })}
      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
    >
      Open Warning Confirmation
    </button>
    <ConfirmationModal
      isOpen={confirmModalOpen.warning}
      variant="warning"
      title="Force Reassign"
      message="This will interrupt the current work. Continue?"
      confirmText="Force Reassign"
      cancelText="Cancel"
      onConfirm={() => {
        alert('Reassignment initiated!');
        setConfirmModalOpen({ ...confirmModalOpen, warning: false });
      }}
      onClose={() => setConfirmModalOpen({ ...confirmModalOpen, warning: false })}
    />
  </div>

  {/* Loading State Example */}
  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
    <p className="text-sm font-semibold text-gray-900 mb-3">Loading State:</p>
    <button
      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50"
      disabled={true}
    >
      Try Again (disabled due to loading)
    </button>
    <p className="text-xs text-gray-600 mt-2">
      In real usage, pass isLoading=true to show loading spinner
    </p>
  </div>
</div>
```

**Variants to Show:**
- Default (blue with CheckCircle)
- Danger (red with AlertTriangle)
- Warning (orange with AlertTriangle)
- Loading state in progress

---

### 5. TimerBadge Showcase Section

**Code Example:**
```jsx
{/* TimerBadge Examples */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">TimerBadge Variants</h3>
  <p className="text-sm text-gray-600 mb-4">
    Time display with color-coded urgency levels
  </p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Green - Plenty of time */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm font-semibold text-gray-900 mb-3">Low Urgency (Green)</p>
      <TimerBadge
        time="2h 45m"
        status="Time remaining"
        variant="green"
      />
    </div>

    {/* Orange - Moderate urgency */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm font-semibold text-gray-900 mb-3">Moderate Urgency (Orange)</p>
      <TimerBadge
        time="45m 30s"
        status="Approaching deadline"
        variant="orange"
      />
    </div>

    {/* Red - Critical urgency */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm font-semibold text-gray-900 mb-3">High Urgency (Red)</p>
      <TimerBadge
        time="10m 15s"
        status="Deadline critical"
        variant="red"
      />
    </div>
  </div>

  {/* Usage Context */}
  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm text-blue-900">
      <strong>Typical Usage:</strong> Display assignment duration or TAT (Turn Around Time) remaining
    </p>
    <p className="text-xs text-blue-700 mt-2">
      Variant selection: green if > 50% remaining, orange if 20-50%, red if < 20%
    </p>
  </div>
</div>
```

**Color Variants:**
- Green: Plenty of time (< 50% elapsed)
- Orange: Moderate (50-80% elapsed)
- Red: Critical (> 80% elapsed)

---

## Phase 2: Advanced Components

### 6. ClaimActionMenu Showcase

**Code Example:**
```jsx
{/* ClaimActionMenu Examples */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. ClaimActionMenu (Status-Based)</h3>
  <p className="text-sm text-gray-600 mb-4">
    Context-aware action menu that changes based on claim status
  </p>

  {/* Test Claims with Different Statuses */}
  <div className="space-y-4">
    {[
      { status: 'UNASSIGNED', claim: { ...testClaim, editStatus: 'UNASSIGNED' } },
      { status: 'PENDING', claim: { ...testClaim, editStatus: 'PENDING', assignedTo: 'EDR-001' } },
      { status: 'IN_PROGRESS', claim: { ...testClaim, editStatus: 'IN_PROGRESS' } },
      { status: 'ADJUDICATED', claim: { ...testClaim, editStatus: 'ADJUDICATED', lctSubmissionCount: 1 } }
    ].map(({ status, claim }) => (
      <div key={status} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{status} State</p>
          <p className="text-xs text-gray-600">Available actions: {getActionsForStatus(status)}</p>
        </div>
        <ClaimActionMenu row={claim} />
      </div>
    ))}
  </div>

  {/* Keyboard Navigation Info */}
  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm font-semibold text-blue-900 mb-2">Keyboard Navigation:</p>
    <ul className="text-xs text-blue-700 space-y-1">
      <li>Arrow Down/Up - Navigate menu items</li>
      <li>Home/End - Jump to first/last item</li>
      <li>Escape - Close menu</li>
      <li>Enter - Activate selected action</li>
    </ul>
  </div>
</div>

// Helper function
function getActionsForStatus(status) {
  const actions = {
    UNASSIGNED: 'Self-Assign & Edit, Assign To, View, Audit',
    PENDING: 'Self-Assign & Edit, Reassign To, View, Audit',
    IN_PROGRESS: 'Force Reassign, Self-Assign & Edit, View, Audit',
    ADJUDICATED: 'Re-Edit, View, Audit'
  };
  return actions[status] || 'View, Audit';
}
```

**Menu States to Show:**
- UNASSIGNED: 4 actions
- PENDING: 4 actions
- IN_PROGRESS: 4 actions (force reassign prominent)
- ADJUDICATED: 3 actions (re-edit available)
- LOCKED: 2 actions (view-only)

---

### 7. ClaimAuditModal Showcase

**Code Example:**
```jsx
const [auditModalOpen, setAuditModalOpen] = useState(false);

{/* ClaimAuditModal Example */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. ClaimAuditModal</h3>
  <p className="text-sm text-gray-600 mb-4">
    View complete audit trail for a specific claim
  </p>

  <button
    onClick={() => setAuditModalOpen(true)}
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
  >
    View Claim Audit Trail
  </button>

  <ClaimAuditModal
    isOpen={auditModalOpen}
    onClose={() => setAuditModalOpen(false)}
    claim={testClaim}
  />

  {/* Description */}
  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
    <p className="text-sm text-gray-900">
      Shows all events related to this claim:
    </p>
    <ul className="text-xs text-gray-700 mt-2 space-y-1 list-disc list-inside">
      <li>Claim assignment events</li>
      <li>Reassignment events (standard and force)</li>
      <li>Adjudication events</li>
      <li>Re-adjudication events</li>
      <li>Data modifications</li>
    </ul>
  </div>
</div>
```

---

### 8. AuditTable Standalone

**Code Example:**
```jsx
{/* Standalone AuditTable Example */}
<div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">8. AuditTable Component</h3>
  <p className="text-sm text-gray-600 mb-4">
    Reusable table for displaying audit entries with expandable details
  </p>

  <AuditTable
    entries={generateMockAuditEntries(10)}
    hideClaimColumn={false}
    hideUserColumn={false}
  />

  {/* Column Control Example */}
  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
    <p className="text-sm font-semibold text-gray-900 mb-3">Flexible Column Display:</p>
    <div className="space-y-2">
      <p className="text-xs text-gray-700">Full view (above)</p>
      <p className="text-xs text-gray-700">Can hide Claim Column: hideClaimColumn=true</p>
      <p className="text-xs text-gray-700">Can hide User Column: hideUserColumn=true</p>
    </div>
  </div>
</div>

// Helper function
function generateMockAuditEntries(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `audit-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
    eventType: ['CLAIM_ASSIGNED', 'CLAIM_REASSIGNED', 'CLAIM_ADJUDICATED'][i % 3],
    performedByName: ['Priya Sharma', 'John Doe', 'Jane Smith'][i % 3],
    claimId: `CLM-${3000 + i}`,
    userName: i % 2 === 0 ? `User-${i}` : null,
    details: { reason: 'Sample audit detail' },
    changes: { status: { from: 'PENDING', to: 'IN_PROGRESS' } }
  }));
}
```

---

## Phase 3: Polish & Documentation

### File Structure for Implementation

```
/src/pages/demos/
├── ComponentShowcase.jsx (MAIN FILE - Add new tabs here)
└── examples/
    ├── DataTableExamples.jsx
    ├── StatusBadgeExamples.jsx
    ├── StatsCardExamples.jsx
    ├── ConfirmationModalExamples.jsx
    ├── TimerBadgeExamples.jsx
    ├── ClaimActionMenuExamples.jsx
    ├── ClaimAuditModalExamples.jsx
    └── AuditTableExamples.jsx
```

---

## Adding New Tabs

### Import Statements to Add

```jsx
import {
  DataTable,
  StatusBadge,
  StatsCard,
  ClaimActionMenu,
  TimerBadge,
  ConfirmationModal,
  SearchBar,
  AuditTable
} from '../../components/common';

import {
  ClaimAuditModal
} from '../../components/common';
```

### Tab Configuration Update

```jsx
const tabs = [
  { id: 'edit-manager', label: 'Edit Manager Core' },
  { id: 'user-management', label: 'User Management' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'audit', label: 'Audit Log' },
  { id: 'ui-components', label: 'UI Components' },  // ADD THIS
  { id: 'shared', label: 'Shared Widgets' }
];
```

### Tab Rendering Update

```jsx
{selectedTab === 'ui-components' && (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Group 5: UI Components (8)
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Reusable UI elements for consistent design across the application
      </p>
      {/* Add component showcases here */}
    </div>
  </div>
)}
```

---

## Testing Checklist

- [ ] All components render without errors
- [ ] Props are correctly passed and functional
- [ ] Modals open/close properly
- [ ] Callbacks trigger correctly
- [ ] Loading states display correctly
- [ ] Empty states handled
- [ ] Keyboard navigation works (especially modals)
- [ ] Responsive design on mobile
- [ ] Accessibility (ARIA labels, focus)
- [ ] Mock data integrates properly

---

## Performance Considerations

- Lazy load components if tab count gets high
- Use `React.memo()` for re-render optimization
- Consider pagination for large mock datasets
- Test Redux integration performance

---

## Accessibility Requirements

All showcase examples should:
- Have proper ARIA labels
- Support keyboard navigation
- Have proper focus management
- Display proper heading hierarchy
- Use semantic HTML

---

## Documentation Format

Each component example should include:
```jsx
/**
 * Component Name
 * 
 * Purpose: What this component does
 * 
 * Props:
 * - prop1 (type): Description
 * - prop2 (type): Description
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * Typical Usage: Where it's used in the app
 */
```

---

## Estimated Implementation Time

| Component | Effort | Notes |
|-----------|--------|-------|
| DataTable | 1.5h | Need multiple examples |
| StatusBadge | 0.5h | Just grid of variants |
| StatsCard | 0.5h | Grid with different configs |
| ConfirmationModal | 1h | 3 variants + loading |
| TimerBadge | 0.5h | 3 color variants |
| **Subtotal P1** | **4h** | |
| ClaimActionMenu | 1.5h | 5 status states |
| ClaimAuditModal | 1h | Nested component demo |
| AuditTable | 0.5h | Expandable rows |
| SearchBar | 0.5h | Simple showcase |
| **Subtotal P2** | **3.5h** | |
| Documentation | 1.5h | Code comments, props |
| Testing | 1.5h | Cross-browser, mobile |
| **Subtotal P3** | **3h** | |
| **TOTAL** | **10.5h** | Realistic estimate |

---

## References

- Component paths: `/src/components/common/`, `/src/components/manager/`
- Current showcase: `/src/pages/demos/ComponentShowcase.jsx`
- Design tokens: `.cursor/rules/design_system_rules.md`
- Mock data: `/src/constants/mockData.jsx`

