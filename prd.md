# Product Requirements Document (PRD)
## Edit Manager Role - OPD Claims Edit Portal

---

## Document Control

| **Version** | **Date** | **Author** | **Status** |
|-------------|----------|------------|------------|
| 1.0 | October 31, 2025 | Product Team | Final |

**Project:** OPD Claims Edit Portal - Edit Manager Module  
**Team:** Vitraya Kenya (VKNY)  
**Stakeholders:** Edit Managers, Editors, LCT Team, Audit & Compliance

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Objectives](#2-problem-statement--objectives)
3. [User Personas & Roles](#3-user-personas--roles)
4. [Feature Specifications](#4-feature-specifications)
5. [User Interface & Experience](#5-user-interface--experience)
6. [Data Model & Architecture](#6-data-model--architecture)
7. [Business Rules & Logic](#7-business-rules--logic)
8. [Integration Requirements](#8-integration-requirements)
9. [Analytics & Reporting](#9-analytics--reporting)
10. [Security & Access Control](#10-security--access-control)
11. [Performance Requirements](#11-performance-requirements)
12. [Edge Cases & Error Handling](#12-edge-cases--error-handling)
13. [Acceptance Criteria](#13-acceptance-criteria)
14. [Implementation Phases](#14-implementation-phases)
15. [Appendix](#15-appendix)

---

## 1. Executive Summary

### 1.1 Overview
This PRD defines the **Edit Manager Role** within the OPD Claims Edit Portal, introducing supervisory capabilities for claim quality control, workload management, and team performance monitoring. The Edit Manager role enables centralized oversight of the claim adjudication workflow, ensuring quality standards while optimizing editor productivity.

### 1.2 Goals
- **Quality Assurance:** Enable managers to re-adjudicate claims requiring additional review (max 3 LCT submissions per claim)
- **Workload Optimization:** Provide claim reassignment capabilities (standard and force modes) with real-time capacity visibility
- **Team Management:** Support user lifecycle management (add, activate, deactivate) with password reset functionality
- **Performance Tracking:** Deliver comprehensive analytics on individual editor performance and business metrics
- **Operational Efficiency:** Enable bulk claim operations and round-robin workload distribution
- **Compliance:** Maintain complete audit trail of all claim lifecycle events

### 1.3 Success Metrics
- Reduction in LCT rejection rate through manager re-edits
- Balanced workload distribution across editors (measured by standard deviation of assigned claim counts)
- Improved claim processing time through optimal reassignment
- 100% audit trail coverage for all claim actions
- Manager decision-making time reduced through real-time capacity view

---

## 2. Problem Statement & Objectives

### 2.1 Current State
The OPD Claims Edit Portal currently lacks supervisory controls, resulting in:
- No mechanism for quality review before LCT submission
- Inability to redistribute workload when editors are unavailable or overloaded
- No centralized user management or performance visibility
- Limited audit trail for compliance and dispute resolution
- Manual intervention required for claim routing decisions

### 2.2 Desired State
Implement Edit Manager role with capabilities to:
- Review and re-adjudicate claims requiring additional scrutiny
- Dynamically reassign claims based on capacity and priority
- Manage editor access and credentials centrally
- Monitor individual and team performance through analytics
- Track complete claim lifecycle with granular audit logs
- Make data-driven decisions through real-time operational visibility

### 2.3 Key Objectives

| **Objective** | **Key Results** |
|---------------|-----------------|
| **Quality Control** | ≤15% of re-edited claims rejected by LCT (baseline: unknown) |
| **Workload Balance** | <20% variance in claim distribution across active editors |
| **Operational Efficiency** | Manager can reassign 10+ claims in <2 minutes via bulk operations |
| **Visibility** | Real-time capacity view updates <1 second latency |
| **Compliance** | 100% of claim actions logged in audit trail within 1 second |
| **User Management** | Manager can add/deactivate users in <30 seconds |

---

## 3. User Personas & Roles

### 3.1 Edit Manager

**Profile:**
- **Role:** Supervisory role overseeing claim adjudication quality and editor performance
- **Responsibilities:** Quality assurance, workload management, team administration, performance monitoring
- **Technical Proficiency:** High (medical background + system expertise)
- **Work Pattern:** Monitors dashboard throughout day, intervenes on exceptions, reviews analytics weekly

**Key Needs:**
- Quickly identify claims requiring re-review
- Redistribute work when editors are overloaded or unavailable
- Understand which editors need coaching vs. recognition
- Ensure compliance through complete audit trails
- Make data-driven decisions on resource allocation

**Permissions:**
- All Editor permissions (can perform re-adjudication)
- User management (add, activate, deactivate, reset password)
- Claim reassignment (standard and force modes)
- Access to all analytics and audit logs
- Bulk operations on claims

**Note:** A user cannot hold both Manager and Editor roles simultaneously. Managers can perform editing actions (specifically re-adjudication), but their system role is distinctly "Manager."

### 3.2 Editor (Context for Manager Features)

**Profile:**
- **Role:** Medical professional performing claim adjudication
- **Interaction with Manager Features:** Receives reassigned claims, sees capacity impact, appears in analytics
- **Key Needs from Manager:** Fair workload distribution, clear expectations, timely support

---

## 4. Feature Specifications

### 4.1 Feature 1: Readjudication (Re-Edit)

#### 4.1.1 Overview
Enable Edit Managers to re-adjudicate claims that have already been submitted to LCT, up to a maximum of 3 total submissions per claim. This provides a quality control mechanism before claims reach final vetting status.

#### 4.1.2 Functional Requirements

**FR-1.1: Re-Edit Button Placement**
- **Location 1:** Claims grid in Edit Manager dashboard (Actions column)
- **Location 2:** Claim detail view (top action bar, next to existing action buttons)
- **Visual Design:** Button labeled "Re-Edit" with secondary/outline styling to distinguish from primary "Edit" action
- **State Management:** 
  - Enabled: When claim has Edit Status = "ADJUDICATED" or "RE-ADJUDICATED" AND LCT submission count < 3
  - Disabled: When LCT submission count = 3 (button greyed out, tooltip: "Maximum re-edit attempts reached")
  - Hidden: When claim Edit Status = "PENDING" or "AUTOMATED" (not yet adjudicated)

**FR-1.2: Re-Edit Workflow**
```
Manager clicks "Re-Edit"
    ↓
System loads claim in full edit interface (4-step workflow identical to editor experience)
    ↓
Manager reviews/modifies:
  - Digitization (Step 1)
  - Checklist/Information Verification (Step 2)
  - Clinical Validation (Step 3)
  - Review & Submit Decision (Step 4)
    ↓
Manager completes adjudication and submits
    ↓
System displays "Assign to Editor" modal
    ↓
Manager selects target editor from dropdown (active editors only, excluding self)
    ↓
System confirms assignment
    ↓
Claim enters target editor's queue with status "RE-ADJUDICATED"
    ↓
Target editor receives notification (in-app + email)
```

**FR-1.3: LCT Submission Count Tracking**
- **Data Model:** Add field `lct_submission_count` to claims table (INTEGER, default: 1)
- **Increment Logic:**
  - Initial editor adjudication → count = 1
  - First manager re-edit → count = 2
  - Second manager re-edit → count = 3
  - Count does NOT include initial AI adjudication
- **Business Rule:** Hard limit of 3. No override mechanism. Claims reaching 3 cannot be re-edited.
- **UI Display:** Show count in claim detail view (for manager visibility): "LCT Submissions: 2/3"

**FR-1.4: Status Management**
- **New Status:** "RE-ADJUDICATED" (added to Edit Status enum)
- **Status Transition:**
  ```
  ADJUDICATED → [Manager clicks Re-Edit] → RE-ADJUDICATED
  RE-ADJUDICATED → [Manager re-edits again] → RE-ADJUDICATED
  ```
- **Status does NOT revert to "PENDING"** after re-edit

**FR-1.5: Timer Management**
- Timer restarts when manager opens claim for re-edit
- Timer restarts when assigned editor opens re-adjudicated claim
- Timer behavior follows existing 6-minute countdown rules (color coding, persistence)

**FR-1.6: Data Preservation**
- **Previous Editor Work:** All editor adjudication data preserved in audit trail
- **AI Adjudication:** Always preserved (never overwritten)
- **Manager Re-Edit:** Creates new audit entry; does not overwrite previous entries

**FR-1.7: Post-Submission Assignment**
- **Assignment Modal:**
  - Dropdown: Shows list of active editors (Name + current queue count)
  - Search: Filter editors by name
  - Validation: Cannot assign to self, cannot assign to inactive editors
  - Default: No pre-selection (manager must choose)
- **Notification to Assigned Editor:**
  - In-app notification: "New claim [Claim ID] assigned by [Manager Name] for re-review"
  - Email notification: Subject "Claim [Claim ID] Reassigned for Re-Adjudication"
  - Claim appears in editor's assigned queue

**FR-1.8: LCT Integration**
- When manager submits re-adjudication, system sends updated adjudication payload to LCT
- LCT Portal displays this as a new adjudication entry (separate row in their view)
- LCT receives notification that claim has been re-adjudicated

#### 4.1.3 Non-Functional Requirements

| **Requirement** | **Target** |
|-----------------|------------|
| Re-Edit button state calculation | <100ms |
| Claim load time for re-edit | <2 seconds |
| Assignment modal population | <500ms |
| Audit log entry creation | <1 second after submission |
| LCT notification delivery | <5 seconds after submission |

#### 4.1.4 User Interface Specifications

**Re-Edit Button (Claims Grid):**
```
[Edit] [Re-Edit] [View]
       ↑
       Outline button, orange/warning color
       Enabled: Normal state
       Disabled: Grey with tooltip
```

**Assignment Modal (Post Re-Adjudication):**
```
╔════════════════════════════════════════╗
║  Assign Claim for Re-Review            ║
╠════════════════════════════════════════╣
║                                        ║
║  Select Editor to Assign:              ║
║  ┌──────────────────────────────────┐ ║
║  │ [Search editors...]              │ ║
║  │  ○ John Mwangi (12 claims)       │ ║
║  │  ○ Sarah Kimani (8 claims)       │ ║
║  │  ○ David Ochieng (15 claims)     │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  Note: Editor will be notified via     ║
║  email and in-app notification.        ║
║                                        ║
║  [Cancel]              [Assign Claim]  ║
╚════════════════════════════════════════╝
```

---

### 4.2 Feature 2: Claim Reassignment

#### 4.2.1 Overview
Enable managers to redistribute claims between editors to balance workload, handle unavailability, or optimize processing. Supports both standard reassignment (for not-started claims) and force reassignment (for in-progress claims).

#### 4.2.2 Functional Requirements

**FR-2.1: Standard Reassignment**

**Eligibility Criteria:**
- Claim Edit Status = "PENDING" (not yet started by editor)
- **"Started" Definition:** Claim is considered "started" when editor clicks "Save and Next" on first page (Patient Info, Claim & Policy Details)
- **Not Started:** Claim assigned but editor has not clicked "Save and Next" on first page

**Reassignment Workflow:**
```
Manager selects claim(s) on grid
    ↓
Manager clicks "Reassign" button
    ↓
System validates: All selected claims are "not started"
    ↓
"Reassign Claims" modal opens
    ↓
Manager selects target editor from dropdown
    ↓
Manager clicks "Confirm Reassignment"
    ↓
System updates assignment in database
    ↓
Previous editor notified: "Claim [ID] has been reassigned to [New Editor]"
New editor notified: "Claim [ID] has been assigned to you"
    ↓
Claim appears in new editor's queue, disappears from previous editor's queue
```

**FR-2.2: Force Reassignment**

**Eligibility Criteria:**
- Claim Edit Status = "IN PROGRESS" (editor has started work)
- Used when standard reassignment not possible and urgent reallocation needed

**Force Reassignment Workflow:**
```
Manager selects claim on grid (single claim only for force reassign)
    ↓
Manager clicks "Reassign" button
    ↓
System detects claim is "IN PROGRESS"
    ↓
Warning Modal appears:
  "⚠️ Claim In Progress
   Editor [Name] is currently working on this claim.
   
   Force reassigning will:
   - Remove claim from [Name]'s active session
   - Discard any unsaved changes
   - Preserve all saved progress in audit trail
   
   Do you want to proceed with force reassignment?"
   
   [Cancel] [Force Reassign]
    ↓
[If Cancel] → Process ends
[If Force Reassign] → Continue to editor selection
    ↓
"Select New Editor" dropdown appears in same modal
    ↓
Manager selects target editor
    ↓
Confirmation Modal appears:
  "⚠️ Confirm Force Reassignment
   
   Reassign claim [ID] from [Current Editor] to [New Editor]?
   
   Current editor will be removed from the claim immediately.
   
   [Cancel] [Confirm]"
    ↓
[If Confirm] → Force reassignment executes
    ↓
System:
  - Adds audit log entry: "Claim force reassigned from [Editor A] to [Editor B] by [Manager]"
  - Preserves all saved progress (AI adjudication + saved editor work)
  - Discards unsaved changes in active session
  - Updates assignment to new editor
    ↓
Previous editor notified: "⚠️ Claim [ID] has been force reassigned to [New Editor] by [Manager Name]"
New editor notified: "Claim [ID] has been assigned to you for immediate review"
    ↓
If previous editor had the claim open in browser:
  - Browser shows alert: "This claim has been reassigned. Redirecting to dashboard..."
  - Auto-redirect to claims dashboard after 3 seconds
```

**FR-2.3: Reassignment Button Placement**
- **Location 1:** Claims grid Actions column (per-row)
- **Location 2:** Bulk action toolbar (appears when claims selected)
- **Location 3:** Claim detail view (top action bar)

**FR-2.4: Editor Selection**
- **Dropdown Content:**
  - Shows all active editors (excludes deactivated users)
  - Excludes manager making the assignment (cannot assign to self)
  - Displays: `[Editor Name] ([Current Queue Count] claims)`
  - Sorted by: Queue count (ascending) - helps with load balancing
- **Search Functionality:** Filter editors by name (live search)
- **Validation:** Must select an editor; "Confirm" button disabled until selection made

**FR-2.5: Reassignment Notifications**

**For Previous Editor:**
- **In-App Notification:** "Claim [Claim ID - Visit Number] has been reassigned to [New Editor Name] by [Manager Name]"
- **Email Notification:**
  - Subject: "Claim Reassignment Notification - [Claim ID]"
  - Body: Includes claim ID, reason (standard vs. force), new assignee, timestamp

**For New Editor:**
- **In-App Notification:** "New claim [Claim ID - Visit Number] has been assigned to you by [Manager Name]"
- **Email Notification:**
  - Subject: "New Claim Assignment - [Claim ID]"
  - Body: Includes claim details, priority (if force reassign, mark as urgent), assignment timestamp

**FR-2.6: Audit Trail**
Every reassignment creates audit log entry:
```json
{
  "event_type": "CLAIM_REASSIGNED" | "CLAIM_FORCE_REASSIGNED",
  "claim_id": "CLM-123",
  "previous_assignee": "editor_id_1",
  "new_assignee": "editor_id_2",
  "reassigned_by": "manager_id",
  "reason": "STANDARD" | "FORCE",
  "timestamp": "2025-10-31T14:30:00Z",
  "saved_progress_preserved": true,
  "unsaved_changes_discarded": true  // Only for force reassign
}
```

#### 4.2.3 Business Rules

| **Rule ID** | **Rule Description** | **Enforcement** |
|-------------|----------------------|-----------------|
| BR-2.1 | Cannot reassign claim to current assignee | UI validation: Current assignee greyed out in dropdown |
| BR-2.2 | Cannot reassign to inactive/deactivated editors | Dropdown only shows active editors |
| BR-2.3 | Cannot reassign to manager performing the action | Dropdown excludes self |
| BR-2.4 | Standard reassign only for "not started" claims | Button disabled or warning shown for started claims |
| BR-2.5 | Force reassign requires double confirmation | Two-step modal confirmation required |
| BR-2.6 | Force reassign discards unsaved changes only | Saved progress always preserved |
| BR-2.7 | Force reassigned claims marked as urgent for new editor | Flag set in database, visual indicator in new editor's queue |

#### 4.2.4 Edge Cases

| **Scenario** | **System Behavior** |
|--------------|---------------------|
| Editor completes claim during force reassign process | If submission happens before reassignment commits, allow submission to complete; abort reassignment with message "Claim has been completed and cannot be reassigned" |
| Network failure during reassignment | Transaction rollback; show error message "Reassignment failed. Please try again"; no partial state changes |
| Editor is viewing (not editing) claim when reassigned | No interruption; editor can continue viewing; if they try to edit, show message "This claim has been reassigned and is no longer available for editing" |
| Manager attempts to reassign their own re-edit in progress | Allow force reassign to another editor (manager can reassign their own work) |
| Multiple managers attempt concurrent reassignment of same claim | First commit wins; subsequent attempts receive error "Claim has already been reassigned to [Editor]" |

---

### 4.3 Feature 3: User Management

#### 4.3.1 Overview
Enable Edit Managers to manage editor accounts throughout their lifecycle: creation, activation, deactivation, and password resets. Supports team scaling and access control without IT intervention.

#### 4.3.2 Functional Requirements

**FR-3.1: User Roles**
- **Available Roles:** Editor, Manager
- **Role Exclusivity:** A user account can hold only ONE role (mutually exclusive)
- **Role Assignment:** Set during user creation, cannot be changed post-creation (requires deactivation and new account creation to change role)

**FR-3.2: Add New User**

**Workflow:**
```
Manager navigates to "User Management" section
    ↓
Manager clicks "Add New User" button
    ↓
"Create New User" modal opens
    ↓
Manager enters required fields:
  - Full Name (required)
  - Email Address (required, must be valid format)
  - Role (required, dropdown: Editor | Manager)
    ↓
Manager clicks "Create User"
    ↓
System validates:
  - Email is unique (not already in use)
  - Email format is valid
  - All required fields completed
    ↓
[If validation fails] → Show error message, remain on modal
[If validation passes] → Continue to user creation
    ↓
System:
  - Creates user record in database with status "ACTIVE"
  - Generates temporary password
  - Sends welcome email with login link + temporary password
  - Email includes: "You must change your password on first login"
    ↓
Success message displayed: "User [Name] created successfully. Welcome email sent to [Email]."
    ↓
User list refreshes to show new user
```

**FR-3.3: Create User Modal Specifications**
```
╔════════════════════════════════════════╗
║  Create New User                       ║
╠════════════════════════════════════════╣
║                                        ║
║  Full Name *                           ║
║  ┌──────────────────────────────────┐ ║
║  │                                  │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  Email Address *                       ║
║  ┌──────────────────────────────────┐ ║
║  │                                  │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  Role *                                ║
║  ┌──────────────────────────────────┐ ║
║  │ [Select Role ▼]                  │ ║
║  └──────────────────────────────────┘ ║
║    ○ Editor                            ║
║    ○ Manager                           ║
║                                        ║
║  * Required fields                     ║
║                                        ║
║  [Cancel]                 [Create User]║
╚════════════════════════════════════════╝
```

**Field Validations:**
- **Full Name:** Min 2 characters, max 100 characters, cannot be only whitespace
- **Email:** Must match regex pattern for valid email format, max 255 characters, case-insensitive uniqueness check
- **Role:** Must select one option (cannot be empty)

**FR-3.4: Activate User**

**Context:** Used to reactivate a previously deactivated user.

**Workflow:**
```
Manager views user list
    ↓
User row shows "INACTIVE" status badge
    ↓
Manager clicks "Activate" button in Actions column
    ↓
Confirmation modal:
  "Activate User [Name]?
   
   This user will regain access to the system and can be assigned claims.
   
   [Cancel] [Activate]"
    ↓
[If Activate] → System updates user status to "ACTIVE"
    ↓
System sends reactivation email to user:
  - Subject: "Your Account Has Been Reactivated"
  - Includes password reset link (user must reset password to login)
    ↓
Success message: "User [Name] has been activated. Reactivation email sent."
    ↓
User list refreshes showing "ACTIVE" status
```

**FR-3.5: Deactivate User**

**Context:** Temporarily removes user access without deleting their record or historical data.

**Workflow:**
```
Manager views user list
    ↓
User row shows "ACTIVE" status badge
    ↓
Manager clicks "Deactivate" button in Actions column
    ↓
Warning modal:
  "⚠️ Deactivate User [Name]?
   
   This user will lose access to the system immediately.
   
   Active Claims: [N]
   All active claims will be redistributed to other editors via round-robin.
   
   [Cancel] [Deactivate User]"
    ↓
[If Deactivate] → System executes deactivation process:
  1. Update user status to "INACTIVE"
  2. Identify all claims assigned to this user (status: PENDING or IN PROGRESS)
  3. Redistribute claims via round-robin algorithm to active editors
  4. Create audit log entry for each reassigned claim
  5. Send notification email to user: "Your account has been deactivated"
    ↓
Success message: "User [Name] deactivated. [N] claims redistributed to active editors."
    ↓
User list refreshes showing "INACTIVE" status
```

**Round-Robin Redistribution Logic:**
```python
def redistribute_claims_on_deactivation(deactivated_user_id):
    # Get all claims assigned to deactivated user
    claims_to_reassign = get_claims_by_assignee(deactivated_user_id)
    
    # Get all active editors sorted by current queue count (ascending)
    active_editors = get_active_editors_sorted_by_queue_count()
    
    # Distribute claims evenly
    for i, claim in enumerate(claims_to_reassign):
        # Round-robin: cycle through editors
        target_editor = active_editors[i % len(active_editors)]
        
        # Reassign claim
        reassign_claim(
            claim_id=claim.id,
            from_user=deactivated_user_id,
            to_user=target_editor.id,
            reason="USER_DEACTIVATION"
        )
        
        # Notify new assignee
        send_notification(
            to=target_editor.id,
            message=f"Claim {claim.id} assigned due to user deactivation"
        )
        
        # Audit log
        log_audit_event(
            event_type="CLAIM_AUTO_REASSIGNED",
            claim_id=claim.id,
            triggered_by="USER_DEACTIVATION",
            previous_assignee=deactivated_user_id,
            new_assignee=target_editor.id
        )
```

**FR-3.6: Remove User**
**Business Rule:** User accounts can NEVER be removed/deleted once created. Only deactivation is allowed to preserve historical data integrity and audit trail completeness.

**UI Treatment:** No "Delete" or "Remove" button exists in user management interface.

**FR-3.7: Reset Password**

**Workflow:**
```
Manager views user list
    ↓
Manager clicks "Reset Password" button in Actions column
    ↓
Confirmation modal:
  "Send Password Reset Email?
   
   A password reset link will be sent to:
   [user.email@domain.com]
   
   The link will expire in 24 hours.
   
   [Cancel] [Send Reset Link]"
    ↓
[If Send] → System generates secure reset token
    ↓
System sends email to user:
  Subject: "Password Reset Request"
  Body:
    - Reset link with token
    - Expiry notice (24 hours)
    - Initiated by: [Manager Name]
    ↓
Success message: "Password reset email sent to [user.email]"
```

**Password Reset Email Template:**
```
Subject: Password Reset Request for OPD Edit Portal

Hello [User Name],

A password reset has been initiated for your account by [Manager Name].

Click the link below to reset your password:
[Reset Link - Valid for 24 hours]

If you did not request this reset, please contact your manager immediately.

Best regards,
OPD Edit Portal Team
```

**FR-3.8: View User Analytics**

**Workflow:**
```
Manager views user list
    ↓
Manager clicks "View Analytics" button for a user
    ↓
System redirects to Individual Editor Analytics page
    ↓
Page displays detailed performance metrics for selected editor
(See Section 4.6 for analytics specifications)
```

**FR-3.9: User List Display**

**Columns:**
| **Column** | **Description** | **Sort** |
|------------|-----------------|----------|
| Name | User's full name | Yes |
| Email | User's email address | Yes |
| Role | Editor or Manager | Filter |
| Status | ACTIVE or INACTIVE | Filter |
| Claims Assigned | Current count of assigned claims | Yes |
| Last Login | Timestamp of last system access | Yes |
| Created Date | User creation timestamp | Yes |
| Actions | Buttons: Activate/Deactivate, Reset Password, View Analytics | N/A |

**Filter Options:**
- Role: All / Editor / Manager
- Status: All / Active / Inactive
- Search: By name or email (live search)

**Pagination:** 25 users per page (configurable)

#### 4.3.3 Business Rules

| **Rule ID** | **Rule Description** | **Enforcement** |
|-------------|----------------------|-----------------|
| BR-3.1 | Email addresses must be unique across all users (active + inactive) | Database unique constraint + UI validation |
| BR-3.2 | User role cannot be changed after creation | No "Edit Role" functionality provided |
| BR-3.3 | Inactive users cannot be assigned claims | Assignment dropdowns exclude inactive users |
| BR-3.4 | Inactive users cannot login | Authentication check blocks inactive status |
| BR-3.5 | Deactivated user's claims auto-redistribute within 30 seconds | Background job triggered on deactivation |
| BR-3.6 | Password reset links expire after 24 hours | Token validation checks expiry timestamp |
| BR-3.7 | Users cannot delete their own accounts | UI prevents self-actions on critical operations |
| BR-3.8 | Managers can deactivate other managers | No hierarchy restriction (flat manager structure) |

#### 4.3.4 Audit Trail

Every user management action creates audit log:
```json
{
  "event_type": "USER_CREATED" | "USER_ACTIVATED" | "USER_DEACTIVATED" | "PASSWORD_RESET_INITIATED",
  "target_user_id": "user_123",
  "target_user_email": "editor@example.com",
  "performed_by": "manager_id",
  "timestamp": "2025-10-31T14:30:00Z",
  "additional_data": {
    "claims_redistributed": 12,  // For deactivation
    "reset_token_sent_to": "email"  // For password reset
  }
}
```

---

### 4.4 Feature 4: Individual Editor Performance Analytics

#### 4.4.1 Overview
Provide managers with detailed, actionable insights into individual editor performance, enabling data-driven coaching, workload balancing, and quality improvement decisions.

#### 4.4.2 Functional Requirements

**FR-4.1: Analytics Navigation**

**Entry Points:**
1. **User Management Page:** Click "View Analytics" button on any editor row → redirects to Individual Analytics page pre-filtered for that editor
2. **Main Analytics Dashboard:** Click on editor name in any report/chart → drills down to Individual Analytics page
3. **Direct Navigation:** Sidebar menu "Analytics" → "Individual Performance" → Editor selector dropdown

**FR-4.2: Individual Analytics Page Structure**

**Page Layout:**
```
╔════════════════════════════════════════════════════════════════╗
║  Individual Editor Performance                                 ║
╠════════════════════════════════════════════════════════════════╣
║  Editor: [John Mwangi ▼]     Period: [This Week ▼]  [Export] ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ KEY METRICS (Cards - 4 across)                          │  ║
║  │  [Claims Assigned]  [Adjudicated]  [Pending]  [Queried]│  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ ADJUDICATION OUTCOMES                                   │  ║
║  │  Approved | Rejected | Partially Approved               │  ║
║  │  [Pie Chart]                                            │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ QUALITY INDICATORS                                      │  ║
║  │  - Manager Re-Edits Count                               │  ║
║  │  - Vetting Status Breakdown (Approved/Rejected/Partial) │  ║
║  │  - Reassignment Count                                   │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ PERFORMANCE TRENDS (Line Chart)                         │  ║
║  │  - Daily adjudication count over selected period        │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ DETAILED CLAIMS TABLE                                   │  ║
║  │  Claim ID | Status | Outcome | Vetting | Actions        │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚════════════════════════════════════════════════════════════════╝
```

**FR-4.3: Metrics Definitions**

**Workload Metrics:**

| **Metric** | **Definition** | **Calculation** | **Data Source** |
|------------|----------------|-----------------|-----------------|
| **Claims Assigned** | Total number of claims assigned to this editor in selected period | `COUNT(claims WHERE assigned_user_id = editor_id AND assignment_date IN period)` | Claims table |
| **Adjudicated** | Claims submitted by editor (completed adjudication) | `COUNT(claims WHERE adjudicated_by = editor_id AND adjudication_date IN period AND edit_status = 'ADJUDICATED')` | Claims table |
| **Pending** | Claims currently assigned but not yet started | `COUNT(claims WHERE assigned_user_id = editor_id AND edit_status = 'PENDING')` | Claims table (real-time) |
| **Queried** | Claims where editor raised queries | `COUNT(claims WHERE assigned_user_id = editor_id AND query_status = 'OPEN' OR 'PENDING_RESPONSE')` | Claims table |

**Note on Claims Assigned:** 
- Includes both initial assignments and reassignments TO this editor
- If claim is reassigned FROM this editor to another, it still counts in their "assigned" total (shows full workload history)
- Current workload = Pending + Queried + In Progress

**Outcome Metrics:**

| **Metric** | **Definition** | **Calculation** | **Data Source** |
|------------|----------------|-----------------|-----------------|
| **Approved** | Claims fully approved by editor's adjudication | `COUNT(claims WHERE adjudicated_by = editor_id AND decision = 'APPROVED')` | Claims table |
| **Rejected** | Claims fully rejected by editor's adjudication | `COUNT(claims WHERE adjudicated_by = editor_id AND decision = 'REJECTED')` | Claims table |
| **Partially Approved** | Claims with partial approval by editor's adjudication | `COUNT(claims WHERE adjudicated_by = editor_id AND decision = 'PARTIAL')` | Claims table |

**Percentages Displayed:**
- Approved % = (Approved / Adjudicated) × 100
- Rejected % = (Rejected / Adjudicated) × 100
- Partially Approved % = (Partially Approved / Adjudicated) × 100

**Quality Indicators:**

| **Metric** | **Definition** | **Calculation** | **Interpretation** |
|------------|----------------|-----------------|-------------------|
| **Manager Re-Edits** | Number of claims this editor adjudicated that were subsequently re-edited by manager | `COUNT(DISTINCT claim_id WHERE original_adjudicator = editor_id AND re_edited_by = ANY(manager_ids))` | Higher count may indicate quality issues needing coaching |
| **LCT Vetting - Approved** | Of editor's adjudicated claims that received LCT vetting status, how many were approved | `COUNT(claims WHERE adjudicated_by = editor_id AND lct_vetting_status = 'APPROVED')` | High % indicates good alignment with LCT standards |
| **LCT Vetting - Rejected** | Of editor's adjudicated claims that received LCT vetting status, how many were rejected | `COUNT(claims WHERE adjudicated_by = editor_id AND lct_vetting_status = 'REJECTED')` | High % indicates potential training need |
| **LCT Vetting - Partial** | Of editor's adjudicated claims that received LCT vetting status, how many were partially approved | `COUNT(claims WHERE adjudicated_by = editor_id AND lct_vetting_status = 'PARTIAL')` | Context-dependent; may indicate cautious approach |
| **LCT Vetting - Pending** | Claims submitted to LCT but vetting status not yet received | `COUNT(claims WHERE adjudicated_by = editor_id AND lct_vetting_status = 'PENDING')` | Shows claims in LCT review pipeline |
| **Reassignment Count** | Number of times claims were reassigned FROM this editor to others | `COUNT(reassignment_events WHERE previous_assignee = editor_id AND event_type = 'REASSIGNED')` | High count may indicate overload or availability issues |

**Note on Multiple Adjudications:**
- If the same claim is adjudicated multiple times by the same editor (after reassignment back to them), each adjudication counts separately in "Adjudicated" total
- This provides accurate workload measurement

**FR-4.4: Time Period Filters**

**Default View:** "This Week" (Monday-Sunday of current week, IST timezone)

**Available Filters:**
- Today (current day, 00:00-23:59 IST)
- This Week (current week, Monday-Sunday IST)
- This Month (current calendar month IST)
- Last 7 Days (rolling 7-day window)
- Last 30 Days (rolling 30-day window)
- Custom Date Range (date picker: start date + end date)
- All Time (no date filter - historical data since account creation)

**Filter Behavior:**
- All metrics recalculate when filter changes
- Charts/graphs update to reflect selected period
- URL parameter updates to preserve filter state (shareable links)

**FR-4.5: Key Metrics Cards**

**Visual Design:** 4 cards in a row, each showing:
```
┌─────────────────┐
│ METRIC NAME     │
│                 │
│    [Large #]    │
│                 │
│ ↑ +X% vs prev   │  ← Trend indicator (optional)
└─────────────────┘
```

**Example:**
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Claims Assigned │  Adjudicated    │    Pending      │    Queried      │
│                 │                 │                 │                 │
│      48         │      42         │       4         │       2         │
│                 │                 │                 │                 │
│  ↑ +12% vs last │  ↑ +8% vs last  │  ↓ -20% vs last │  ↑ +50% vs last │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Color Coding:**
- **Adjudicated:** Green (positive performance)
- **Pending/Queried:** Orange if count > threshold (e.g., >10), else grey

**FR-4.6: Adjudication Outcomes Visualization**

**Chart Type:** Donut chart (pie chart with center label)

**Data:**
- Approved (green slice)
- Rejected (red slice)
- Partially Approved (yellow slice)

**Center Label:** Total Adjudicated count

**Legend:** Shows count + percentage for each category

**FR-4.7: Quality Indicators Section**

**Display Format:** Table with 2 columns

| **Indicator** | **Value** |
|---------------|-----------|
| Manager Re-Edits | 5 claims (11.9% of adjudicated) |
| Reassigned From Editor | 3 times |
| **LCT Vetting Status** | |
| ├─ Approved | 28 claims (66.7%) |
| ├─ Rejected | 8 claims (19.0%) |
| ├─ Partial | 4 claims (9.5%) |
| └─ Pending | 2 claims (4.8%) |

**Conditional Highlighting:**
- Manager Re-Edits >20%: Red background (needs attention)
- Manager Re-Edits 10-20%: Yellow background (monitor)
- LCT Rejection Rate >25%: Red background
- LCT Approval Rate >80%: Green checkmark icon

**FR-4.8: Performance Trends Chart**

**Chart Type:** Line chart with area fill

**X-Axis:** Date (daily granularity)
**Y-Axis:** Number of claims adjudicated

**Data Points:** One dot per day showing adjudication count

**Trend Line:** Smoothed line connecting daily counts

**Tooltip on Hover:** "Date: [DD MMM YYYY] | Adjudicated: [N] claims"

**Time Range:** Matches selected period filter

**FR-4.9: Detailed Claims Table**

**Purpose:** Drill-down into specific claims for investigation

**Columns:**
- Claim ID (link to claim detail)
- Visit Number
- Adjudication Date
- Decision (Approved/Rejected/Partial)
- LCT Vetting Status (Approved/Rejected/Partial/Pending)
- Manager Re-Edited? (Yes/No badge)
- Actions (View Claim, View Audit)

**Sorting:** All columns sortable (default: Adjudication Date descending)

**Filtering:** 
- Decision: All / Approved / Rejected / Partial
- Vetting Status: All / Approved / Rejected / Partial / Pending
- Re-Edited: All / Yes / No

**Pagination:** 50 claims per page

**Export:** CSV download of filtered table data

**FR-4.10: Export Functionality**

**Export Button:** Top-right corner of page

**Export Format:** PDF report

**Report Contents:**
- Header: Editor name, date range, generation timestamp
- All key metrics cards (with values)
- Adjudication outcomes chart (image)
- Quality indicators table
- Performance trends chart (image)
- Summary statistics

**File Naming:** `Editor_Performance_[EditorName]_[DateRange]_[Timestamp].pdf`

#### 4.4.3 Calculation Examples

**Scenario:** Editor "John Mwangi" analytics for "This Week" (Oct 27 - Nov 2, 2025)

**Raw Data:**
- Claims assigned to John this week: 15
- Claims John adjudicated this week: 12
  - Approved: 8
  - Rejected: 2
  - Partial: 2
- Claims still pending (not started): 2
- Claims queried: 1
- Manager re-edited John's claims: 1
- LCT vetting received for John's claims:
  - Approved: 7
  - Rejected: 3
  - Partial: 1
  - Pending: 1

**Displayed Metrics:**
- Claims Assigned: **15**
- Adjudicated: **12**
- Pending: **2**
- Queried: **1**
- Approved: **8** (66.7%)
- Rejected: **2** (16.7%)
- Partially Approved: **2** (16.7%)
- Manager Re-Edits: **1** (8.3% of adjudicated)
- LCT Approved: **7** (58.3% of vetting received)
- LCT Rejected: **3** (25.0% of vetting received)
- LCT Partial: **1** (8.3% of vetting received)
- LCT Pending: **1** (8.3% of submitted)

---

### 4.5 Feature 5: Bulk Reassignment

#### 4.5.1 Overview
Enable managers to reassign multiple claims simultaneously, significantly reducing time required for workload redistribution during editor unavailability, team scaling, or load rebalancing scenarios.

#### 4.5.2 Functional Requirements

**FR-5.1: Claim Selection Mechanism**

**Checkbox Implementation:**
- **Location:** First column of claims grid (before "Actions" column)
- **Header Checkbox:** Select/deselect all claims on current page
- **Row Checkboxes:** Individual claim selection
- **Visual State:**
  - Enabled: Claims that are "not started" (Edit Status = PENDING)
  - Disabled (greyed out): Claims that are "started" (Edit Status = IN PROGRESS, ADJUDICATED, RE-ADJUDICATED)
  - Tooltip on disabled checkbox: "Cannot bulk reassign started claims"

**Selection Counter:**
- Display above grid: "X claims selected"
- Updates in real-time as checkboxes toggled

**FR-5.2: Bulk Action Toolbar**

**Trigger:** Toolbar appears when ≥1 claim selected

**Toolbar Position:** Floats at top of claims grid (sticky positioning)

**Toolbar Content:**
```
┌────────────────────────────────────────────────────────┐
│ [X claims selected]  [Clear Selection]  [Assign To ▼] │
└────────────────────────────────────────────────────────┘
```

**"Assign To" Dropdown:**
- Shows list of active editors (Name + current queue count)
- Excludes current assignees if all selected claims have same assignee
- Sorted by queue count (ascending) for load balancing visibility

**FR-5.3: Bulk Reassignment Workflow**

```
Manager selects multiple claims via checkboxes
    ↓
Selection counter updates: "8 claims selected"
    ↓
Bulk action toolbar appears
    ↓
Manager clicks "Assign To" dropdown
    ↓
Manager selects target editor
    ↓
Confirmation modal appears:
  "Bulk Reassign Claims
   
   Reassign 8 selected claims to [Editor Name]?
   
   Claims will be:
   - Removed from current assignees
   - Added to [Editor Name]'s queue
   - Previous assignees will be notified
   
   [Cancel] [Confirm Reassignment]"
    ↓
[If Confirm] → System executes bulk reassignment:
  1. Validate all selected claims are still "not started" (race condition check)
  2. For each claim:
     a. Update assigned_user_id to target editor
     b. Create audit log entry
     c. Send notification to previous assignee
     d. Send notification to new assignee (batched)
  3. Refresh claims grid
    ↓
Success message: "8 claims successfully reassigned to [Editor Name]"
    ↓
Bulk action toolbar disappears
Selection checkboxes reset
```

**FR-5.4: Validation Rules**

| **Validation** | **Enforcement** | **User Feedback** |
|----------------|-----------------|-------------------|
| Cannot select started claims | Checkbox disabled + greyed out | Tooltip: "Cannot bulk reassign started claims" |
| Must select ≥1 claim | "Assign To" button disabled if 0 selected | Button tooltip: "Select at least one claim" |
| Must choose target editor | "Confirm" button disabled until editor selected | Dropdown placeholder: "Select editor..." |
| All selected claims must still be "not started" at execution | Server-side validation before commit | Error: "Some claims have been started and cannot be reassigned. Refresh page and try again." |
| Cannot bulk reassign to same assignee | Dropdown excludes current assignee if all selected claims have same assignee | N/A |

**FR-5.5: Notification Batching**

**Previous Assignees:**
- If multiple claims reassigned FROM the same editor → Send 1 consolidated email:
  - Subject: "Multiple Claims Reassigned - [Count] Claims"
  - Body: Lists all claim IDs reassigned, new assignees, timestamp

**New Assignee:**
- If multiple claims reassigned TO the same editor → Send 1 consolidated email:
  - Subject: "New Claims Assigned - [Count] Claims"
  - Body: Lists all claim IDs, previous assignees, priority indicator, timestamp

**In-App Notifications:**
- Grouped notification: "8 new claims assigned to you by [Manager Name]"
- Expandable to show claim IDs

**FR-5.6: Audit Trail**

Each bulk reassignment creates individual audit log entries per claim:
```json
{
  "event_type": "CLAIM_BULK_REASSIGNED",
  "claim_id": "CLM-123",
  "previous_assignee": "editor_1",
  "new_assignee": "editor_2",
  "reassigned_by": "manager_id",
  "bulk_operation_id": "bulk_op_uuid_12345",  // Groups all claims in same bulk action
  "timestamp": "2025-10-31T14:30:00Z"
}
```

**Bulk Operation Log:**
```json
{
  "operation_id": "bulk_op_uuid_12345",
  "operation_type": "BULK_REASSIGNMENT",
  "performed_by": "manager_id",
  "claims_count": 8,
  "target_assignee": "editor_2",
  "timestamp": "2025-10-31T14:30:00Z",
  "success": true
}
```

#### 4.5.3 Performance Considerations

| **Operation** | **Target** | **Optimization Strategy** |
|---------------|------------|---------------------------|
| Selection of 100+ claims | <500ms per checkbox toggle | Client-side selection state (no API call per click) |
| Bulk reassignment of 50 claims | <5 seconds total | Batch database updates, async notification sending |
| Grid refresh after bulk operation | <2 seconds | Incremental update, only refresh affected rows |

#### 4.5.4 Edge Cases

| **Scenario** | **System Behavior** |
|--------------|---------------------|
| Editor starts claim after selection but before confirmation | Server-side validation rejects that specific claim; others proceed; show error: "1 claim could not be reassigned (already started). 7 claims reassigned successfully." |
| Manager selects claims across multiple pages | Selection persists across pagination; selection counter shows total across all pages |
| Network failure during bulk operation | Transaction rollback; all-or-nothing commit; show error: "Bulk reassignment failed. No claims were reassigned. Please try again." |
| Target editor deactivated between selection and confirmation | Validation error: "Selected editor is no longer active. Please choose another editor." |
| Manager attempts to bulk reassign 100+ claims | Warning modal: "You are reassigning 150 claims. This may take 10-15 seconds. Continue?" |

---

### 4.6 Feature 6: Real-Time Capacity View

#### 4.6.1 Overview
Provide managers with a live, at-a-glance view of editor workload distribution, specifically showing claims that have been assigned but not yet started. Enables proactive workload balancing decisions.

#### 4.6.2 Functional Requirements

**FR-6.1: Capacity View Location**

**Primary Location:** Edit Manager Dashboard (dedicated section)

**Alternative Access:** Sidebar menu → "Capacity Overview"

**FR-6.2: Display Format**

**Layout:** Horizontal card grid or table, one row/card per editor

**Example Card:**
```
┌─────────────────────────────────────────┐
│ John Mwangi                      [→]   │
│ ─────────────────────────────────────  │
│ Assigned (Not Started): 12 claims      │
│ Total Assigned: 25 claims              │
│ ─────────────────────────────────────  │
│ Load: ████████░░ 48%                   │
└─────────────────────────────────────────┘
```

**Card Elements:**
- **Editor Name:** Clickable (drills down to filtered claims grid)
- **Assigned (Not Started):** Primary metric (count of PENDING claims)
- **Total Assigned:** Context metric (PENDING + IN PROGRESS + QUERIED)
- **Load Bar:** Visual indicator of capacity utilization
- **Arrow Icon (→):** Clickable to open filtered claims grid

**FR-6.3: Metrics Definitions**

| **Metric** | **Definition** | **Calculation** |
|------------|----------------|-----------------|
| **Assigned (Not Started)** | Claims assigned to editor that have NOT been started (Edit Status = PENDING) | `COUNT(claims WHERE assigned_user_id = editor_id AND edit_status = 'PENDING')` |
| **Total Assigned** | All claims currently in editor's queue (any non-completed status) | `COUNT(claims WHERE assigned_user_id = editor_id AND edit_status IN ('PENDING', 'IN PROGRESS', 'QUERIED'))` |
| **Load %** | Percentage of maximum capacity (if capacity limits defined) | `(Total Assigned / Max Capacity) × 100` OR relative to team average if no max defined |

**FR-6.4: Real-Time Updates**

**Update Mechanism:** WebSocket connection

**Update Triggers:**
- Claim assigned to editor → Increment count
- Claim started by editor (Save and Next clicked) → Decrement "Not Started", keep "Total Assigned"
- Claim completed by editor → Decrement "Total Assigned"
- Claim reassigned from editor → Decrement both counts
- Claim reassigned to editor → Increment both counts

**Update Latency:** <1 second from event to UI update

**Connection Handling:**
- Auto-reconnect on connection loss
- Fallback to 30-second polling if WebSocket unavailable
- Visual indicator: "Live" badge (green dot) when connected, "Updating..." (yellow) when reconnecting

**FR-6.5: Sorting & Filtering**

**Default Sort:** Descending by "Assigned (Not Started)" count (editors with most unstarted claims at top)

**Sort Options:**
- Assigned (Not Started): High to Low / Low to High
- Total Assigned: High to Low / Low to High
- Editor Name: A-Z / Z-A
- Load %: High to Low / Low to High

**Filter Options:**
- Active Editors Only (default: ON)
- Include Inactive Editors (checkbox)
- Load Threshold: Show only editors with >X assigned claims

**FR-6.6: Drill-Down to Claims Grid**

**Workflow:**
```
Manager clicks on editor name or arrow icon in capacity card
    ↓
System redirects to main claims grid
    ↓
Grid auto-filters to show:
  - Assigned User: [Selected Editor]
  - Edit Status: PENDING (not started claims only)
    ↓
Manager can view claim details, reassign individual claims, or perform bulk actions
    ↓
Breadcrumb navigation: "Capacity View > [Editor Name] > Claims Grid"
```

**Grid URL:** `/claims?assignee=[editor_id]&status=PENDING`

**FR-6.7: Bulk Actions from Capacity View**

**Action Button:** "Reassign" button on each editor card

**Workflow:**
```
Manager clicks "Reassign" on editor card
    ↓
Modal opens:
  "Reassign Claims from [Editor Name]
   
   Select claims to reassign:
   [Checkbox list of PENDING claims for this editor]
   
   Assign to: [Editor Dropdown]
   
   [Cancel] [Reassign Selected]"
    ↓
Manager selects target claims + target editor
    ↓
Standard bulk reassignment workflow executes
    ↓
Capacity view updates in real-time
```

**FR-6.8: Visual Indicators**

**Load Bar Color Coding:**
- 0-50%: Green (healthy capacity)
- 51-75%: Yellow (moderate load)
- 76-90%: Orange (high load)
- 91-100%: Red (at capacity)
- >100%: Red + pulsing (overloaded)

**Alert Icons:**
- ⚠️ Icon appears if editor has >20 unstarted claims (configurable threshold)
- Tooltip: "High unstarted claim count - consider redistributing"

**FR-6.9: Empty State**

**Scenario:** All editors have 0 assigned (not started) claims

**Display:**
```
╔════════════════════════════════════════╗
║  ✓ All Claims In Progress              ║
║                                        ║
║  No claims are waiting to be started.  ║
║  All assigned claims are being actively║
║  worked on by editors.                 ║
╚════════════════════════════════════════╝
```

#### 4.6.3 Capacity View Example

**Display for 5 Editors:**

```
┌─────────────────────────────────────────────────────────┐
│ Real-Time Capacity Overview              [Refresh: ON]  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐             │
│ │ Sarah Kimani                     [→]    │             │
│ │ Assigned (Not Started): 18 claims       │             │
│ │ Total Assigned: 28 claims               │             │
│ │ Load: ████████████████░░ 70%            │ ⚠️          │
│ └─────────────────────────────────────────┘             │
│                                                          │
│ ┌─────────────────────────────────────────┐             │
│ │ John Mwangi                      [→]    │             │
│ │ Assigned (Not Started): 12 claims       │             │
│ │ Total Assigned: 25 claims               │             │
│ │ Load: ████████████░░░░░░ 48%            │             │
│ └─────────────────────────────────────────┘             │
│                                                          │
│ ┌─────────────────────────────────────────┐             │
│ │ David Ochieng                    [→]    │             │
│ │ Assigned (Not Started): 8 claims        │             │
│ │ Total Assigned: 15 claims               │             │
│ │ Load: ██████░░░░░░░░░░░░ 30%            │             │
│ └─────────────────────────────────────────┘             │
│                                                          │
│ ┌─────────────────────────────────────────┐             │
│ │ Grace Wanjiku                    [→]    │             │
│ │ Assigned (Not Started): 5 claims        │             │
│ │ Total Assigned: 12 claims               │             │
│ │ Load: ████░░░░░░░░░░░░░░ 24%            │             │
│ └─────────────────────────────────────────┘             │
│                                                          │
│ ┌─────────────────────────────────────────┐             │
│ │ Peter Kamau                      [→]    │             │
│ │ Assigned (Not Started): 3 claims        │             │
│ │ Total Assigned: 8 claims                │             │
│ │ Load: ███░░░░░░░░░░░░░░░░ 16%            │             │
│ └─────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

**Interpretation:** Sarah Kimani has the highest unstarted claim count (18) and is at 70% capacity. Manager may choose to reassign some of her unstarted claims to Peter Kamau who is at only 16% capacity.

---

### 4.7 Feature 7: Comprehensive Audit History

#### 4.7.1 Overview
Provide complete, chronological traceability of every action taken on a claim throughout its lifecycle, from initial AI adjudication through final vetting status receipt. Supports compliance, dispute resolution, and performance analysis.

#### 4.7.2 Functional Requirements

**FR-7.1: Audit History Access**

**Entry Points:**
1. **Claims Grid:** "View Audit" button in Actions column
2. **Claim Detail View:** "Audit History" tab (top navigation alongside Digitization, Checklist, etc.)
3. **Individual Analytics:** "View Audit" link in Detailed Claims Table

**FR-7.2: Audit History Display Format**

**Layout:** Tabular view with vertical chronological listing (latest event at top)

**Table Columns:**

| **Column** | **Description** | **Width** |
|------------|-----------------|-----------|
| **Timestamp** | Date & time of event (DD MMM YYYY, HH:MM:SS IST) | 15% |
| **Event Type** | Categorized event (e.g., AI Adjudication, Editor Adjudication, Reassignment) | 20% |
| **Actor** | Who performed the action (System, Editor Name, Manager Name) | 15% |
| **Action** | Description of what changed | 35% |
| **Details** | Expandable details (before/after values for field changes) | 10% |
| **Status** | Claim status after this event | 5% |

**FR-7.3: Event Types Tracked**

**Category 1: System Events**

| **Event Type** | **Actor** | **Action Description** | **Details Captured** |
|----------------|-----------|------------------------|---------------------|
| **CLAIM_CREATED** | System | Claim received from upstream system | Claim ID, Visit Number, Patient Name, Policy Number, Claimed Amount |
| **AI_ADJUDICATION** | System | AI processing completed | AI Decision (Approved/Rejected/Partial), AI-Approved Amount, AI-Flagged Items, AI Version/Model ID |
| **SYSTEM_RERUN** | System | AI re-adjudication triggered by editor changes | Trigger Reason (diagnosis changed, bill items added, quantity increased), Previous AI Response, New AI Response |

**Category 2: Assignment Events**

| **Event Type** | **Actor** | **Action Description** | **Details Captured** |
|----------------|-----------|------------------------|---------------------|
| **CLAIM_ASSIGNED** | Manager or System | Claim assigned to editor | Assigned To (Editor Name), Assignment Method (Manual, Round-Robin, Reassignment) |
| **CLAIM_REASSIGNED** | Manager | Claim reassigned to different editor | Previous Assignee, New Assignee, Reason (Standard, Manager Initiated) |
| **CLAIM_FORCE_REASSIGNED** | Manager | Claim force reassigned while in progress | Previous Assignee, New Assignee, Unsaved Changes Discarded: Yes |
| **CLAIM_BULK_REASSIGNED** | Manager | Claim reassigned as part of bulk operation | Previous Assignee, New Assignee, Bulk Operation ID |
| **AUTO_REASSIGNED_DEACTIVATION** | System | Claim auto-reassigned due to user deactivation | Previous Assignee (Deactivated User), New Assignee, Trigger: User Deactivation |

**Category 3: Editor Actions**

| **Event Type** | **Actor** | **Action Description** | **Details Captured** |
|----------------|-----------|------------------------|---------------------|
| **CLAIM_OPENED** | Editor | Editor opened claim for review | Timestamp, Editor Name |
| **CLAIM_STARTED** | Editor | Editor clicked "Save and Next" on first page | Timestamp, Page: Patient Info |
| **FIELD_CHANGED** | Editor | Specific field value changed | Field Name, Previous Value, New Value, Page/Step |
| **BILL_ITEM_ADDED** | Editor | New bill item added to invoice | Item Details (Category, Name, Qty, Unit Price, Amount) |
| **BILL_ITEM_REMOVED** | Editor | Bill item deleted from invoice | Item Details (Category, Name, Qty, Unit Price, Amount) |
| **DIAGNOSIS_CHANGED** | Editor | Diagnosis codes modified | Added Diagnoses, Removed Diagnoses |
| **SYMPTOMS_CHANGED** | Editor | Symptoms modified | Added Symptoms, Removed Symptoms |
| **QUERY_RAISED** | Editor | Editor raised query on claim | Query Type, Query Text, Sent To (LCT, Auditor), Priority |
| **CLAIM_SAVED_DRAFT** | Editor | Editor saved progress (auto-save or manual) | Timestamp |
| **EDITOR_ADJUDICATION** | Editor | Editor submitted final adjudication | Decision (Approved/Rejected/Partial), Approved Amount, Submitted To LCT |

**Category 4: Manager Actions**

| **Event Type** | **Actor** | **Action Description** | **Details Captured** |
|----------------|-----------|------------------------|---------------------|
| **MANAGER_RE_EDIT** | Manager | Manager re-adjudicated claim | Re-Edit Count (1/3, 2/3, 3/3), Decision (Approved/Rejected/Partial), Approved Amount, Assigned To (Editor) |
| **MANAGER_FIELD_CHANGED** | Manager | Manager modified field during re-edit | Field Name, Previous Value, New Value, Page/Step |

**Category 5: LCT Events**

| **Event Type** | **Actor** | **Action Description** | **Details Captured** |
|----------------|-----------|------------------------|---------------------|
| **VETTING_STATUS_RECEIVED** | LCT (via webhook) | LCT vetting status received | Vetting Status (Approved/Rejected/Partial/Pending), Timestamp |

**FR-7.4: Field-Level Change Tracking**

For events of type `FIELD_CHANGED` or `MANAGER_FIELD_CHANGED`, the "Details" column contains expandable content:

**Expandable Detail View:**
```
Field: Patient Name
Step: Digitization
Previous Value: "John Doe"
New Value: "John M. Doe"
Changed At: 31 Oct 2025, 14:32:15 IST
```

**Tracked Fields:**
- **Digitization (Step 1):** All bill table fields (Category, Item Name, Qty, Unit Price, Amount, Item Date, Invoice Assignment), Diagnosis codes, Symptoms
- **Checklist (Step 2):** All checklist item statuses (Pass/Fail)
- **Clinical Validation (Step 3):** Medicine necessary flags, rejection reasons, approved quantities
- **Review (Step 4):** Final decision, approved amount, savings

**FR-7.5: AI Response Versioning**

**Context:** When system rerun occurs (due to diagnosis change, bill item addition, etc.), AI generates a new response. Each version must be logged.

**Event:** `SYSTEM_RERUN`

**Details Column:**
```
Trigger: Diagnosis changed
AI Version: 1 → 2
Previous Response: [Expandable JSON]
New Response: [Expandable JSON]
Changes Detected: 3 bill items flagged, 1 diagnosis validated
```

**Storage:** Each AI response stored as separate JSON blob in audit log with version number

**FR-7.6: Multiple Adjudications Tracking**

**Scenario:** Claim adjudicated by Editor A, then re-edited by Manager, assigned to Editor B, adjudicated again.

**Audit Log Entries:**
1. `EDITOR_ADJUDICATION` - Editor A submits (Attempt 1/3)
2. `MANAGER_RE_EDIT` - Manager re-adjudicates (Attempt 2/3)
3. `CLAIM_REASSIGNED` - Manager assigns to Editor B
4. `EDITOR_ADJUDICATION` - Editor B submits (Attempt 3/3)
5. `VETTING_STATUS_RECEIVED` - LCT vetting status received

**FR-7.7: Vetting Status Logging**

**Event:** `VETTING_STATUS_RECEIVED`

**Data Logged:**
- Vetting Status: Approved / Rejected / Partial / Pending
- Received At: Timestamp (IST)
- Claim Status After: Final status (Approved/Rejected/Partial per LCT decision)

**Note:** LCT feedback/reason is NOT logged (as per clarification)

**FR-7.8: Table Interactions**

**Sorting:**
- Default: Timestamp descending (newest first)
- Sortable columns: Timestamp, Event Type, Actor
- Click column header to toggle sort direction

**Filtering:**
- **Event Type Filter:** Dropdown multi-select (e.g., show only "Editor Adjudication" + "Manager Re-Edit")
- **Actor Filter:** Dropdown (All / System / Specific Editor / Specific Manager)
- **Date Range Filter:** Date picker (filter by timestamp range)

**Pagination:** 50 events per page (configurable)

**Export:** 
- CSV download of full audit trail
- PDF report with formatted table

**FR-7.9: Empty State**

**Scenario:** Newly created claim with no actions yet

**Display:**
```
╔════════════════════════════════════════╗
║  No Activity Yet                       ║
║                                        ║
║  This claim was just created.          ║
║  Audit history will appear as actions  ║
║  are performed on the claim.           ║
╚════════════════════════════════════════╝
```

#### 4.7.3 Audit History Example

**Claim ID:** CLM-28581  
**Visit Number:** 1369896

**Audit Trail:**

| **Timestamp** | **Event Type** | **Actor** | **Action** | **Details** | **Status** |
|---------------|----------------|-----------|------------|-------------|-----------|
| 31 Oct 2025, 15:45:23 | VETTING_STATUS_RECEIVED | LCT (Webhook) | Vetting status received: Approved | Timestamp: 31 Oct 15:45 IST | APPROVED |
| 31 Oct 2025, 14:30:12 | EDITOR_ADJUDICATION | Sarah Kimani | Adjudication submitted (Attempt 2/3) | Decision: Approved, Amount: KSh 4,150 | ADJUDICATED |
| 31 Oct 2025, 14:15:08 | CLAIM_REASSIGNED | John Mwangi (Manager) | Reassigned to Sarah Kimani | Previous: John Mwangi, New: Sarah Kimani | RE-ADJUDICATED |
| 31 Oct 2025, 14:10:45 | MANAGER_RE_EDIT | John Mwangi (Manager) | Re-adjudication submitted (Attempt 1/3) | Decision: Partial, Amount: KSh 3,800 | RE-ADJUDICATED |
| 31 Oct 2025, 14:05:22 | MANAGER_FIELD_CHANGED | John Mwangi (Manager) | Modified Diagnosis | [Expand] | IN PROGRESS |
| 31 Oct 2025, 13:50:00 | CLAIM_OPENED | John Mwangi (Manager) | Opened claim for re-edit | Timer started | IN PROGRESS |
| 30 Oct 2025, 16:20:15 | EDITOR_ADJUDICATION | David Ochieng | Adjudication submitted (Attempt 1/3) | Decision: Rejected, Amount: KSh 0 | ADJUDICATED |
| 30 Oct 2025, 16:10:30 | FIELD_CHANGED | David Ochieng | Modified Bill Item Quantity | [Expand] | IN PROGRESS |
| 30 Oct 2025, 16:05:12 | SYSTEM_RERUN | System | AI re-adjudication triggered | Trigger: Diagnosis changed, AI Version: 1→2 | IN PROGRESS |
| 30 Oct 2025, 16:00:45 | DIAGNOSIS_CHANGED | David Ochieng | Updated diagnosis codes | Added: M00, Removed: None | IN PROGRESS |
| 30 Oct 2025, 15:55:10 | CLAIM_STARTED | David Ochieng | Started adjudication | Page: Patient Info | IN PROGRESS |
| 30 Oct 2025, 15:50:00 | CLAIM_OPENED | David Ochieng | Opened claim for review | Timer started | PENDING |
| 30 Oct 2025, 15:45:00 | CLAIM_ASSIGNED | System (Round-Robin) | Assigned to David Ochieng | Assignment Method: Round-Robin | PENDING |
| 30 Oct 2025, 15:40:30 | AI_ADJUDICATION | System | AI processing completed | Decision: Partial, AI Amount: KSh 3,500, AI Version: 1 | AUTOMATED |
| 30 Oct 2025, 15:35:00 | CLAIM_CREATED | System | Claim received | Claim ID: CLM-28581, Visit: 1369896, Policy: MTRH4118-00 | PENDING |

**Expanded Detail Example (Field Changed):**
```
Field: Bill Item Quantity (Line 2)
Step: Digitization
Item: NEUROGAB 75MG CAP
Previous Value: 30
New Value: 36
Changed At: 30 Oct 2025, 16:10:30 IST
Reason: Updated based on prescription review
```

#### 4.7.4 Performance Requirements

| **Operation** | **Target** |
|---------------|------------|
| Load audit history for claim with <50 events | <1 second |
| Load audit history for claim with 50-200 events | <2 seconds |
| Expand detail for field change | <100ms (client-side) |
| Apply filter (event type, actor) | <500ms |
| Export to CSV (up to 500 events) | <3 seconds |

---

## 5. User Interface & Experience

### 5.1 Edit Manager Dashboard

#### 5.1.1 Page Layout

**URL:** `/manager/dashboard`

**Page Structure:**
```
╔════════════════════════════════════════════════════════════════╗
║  [Logo] Edit Manager Dashboard        [Notifications] [User] ║
╠════════════════════════════════════════════════════════════════╣
║  [Sidebar]                                                     ║
║  ┌────────┐                                                    ║
║  │Dashboard│ ← Active                                          ║
║  │Claims   │                                                    ║
║  │Analytics│                                                    ║
║  │Capacity │                                                    ║
║  │Users    │                                                    ║
║  └────────┘                                                    ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ SUMMARY CARDS (3 across)                                 │ ║
║  │  [Total Claims] [Edit Done] [Edit Pending]               │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ REAL-TIME CAPACITY VIEW                                  │ ║
║  │  (Editor cards with load indicators)                     │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ CLAIMS REQUIRING ATTENTION                               │ ║
║  │  - Claims at 2/3 or 3/3 re-edit limit                    │ ║
║  │  - Claims pending >48 hours                              │ ║
║  │  - High-value claims ($10K+)                             │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ RECENT ACTIVITY FEED                                     │ ║
║  │  - Last 20 actions across all editors/managers           │ ║
║  └──────────────────────────────────────────────────────────┘ ║
╚════════════════════════════════════════════════════════════════╝
```

**Summary Cards:**
- **Total Claims:** Count of all claims in system (any status)
- **Edit Done:** Claims with Edit Status = ADJUDICATED or RE-ADJUDICATED
- **Edit Pending:** Claims with Edit Status = PENDING

**Color Scheme:**
- Primary: Blue (#0066CC) for action buttons
- Success: Green (#28A745) for approved/completed states
- Warning: Orange (#FFC107) for pending/attention items
- Danger: Red (#DC3545) for rejected/overdue items
- Neutral: Grey (#6C757D) for inactive/disabled states

### 5.2 Claims Grid (Enhanced for Manager)

**URL:** `/manager/claims`

**Grid Enhancements for Managers:**

**Additional Columns:**
- **Assigned User:** Shows editor name (green badge), clickable to filter by that editor
- **LCT Submission Count:** Shows "1/3", "2/3", "3/3" with color coding (green→yellow→red)
- **Re-Edit Available:** Icon indicator (✓ if re-edit possible, ✗ if at limit)

**Additional Actions:**
- **Re-Edit** button (orange/outline style)
- **Reassign** button (blue/secondary style)
- **View Audit** button (grey/outline style)

**Bulk Selection:**
- Checkbox column (first column)
- Bulk action toolbar appears when ≥1 claim selected

**Filters (Manager-Specific):**
- **Assigned To:** Dropdown of all editors + "Unassigned" option
- **LCT Submission Count:** 1, 2, 3
- **Re-Edit Available:** Yes / No
- **Vetting Status:** Pending / Approved / Rejected / Partial

### 5.3 User Management Page

**URL:** `/manager/users`

**Page Layout:**
```
╔════════════════════════════════════════════════════════════════╗
║  User Management                      [+ Add New User]         ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Filters: [Role: All ▼] [Status: All ▼] [Search: ___]         ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Name     │ Email    │ Role   │ Status │ Claims │ Actions │ ║
║  ├──────────┼──────────┼────────┼────────┼────────┼─────────┤ ║
║  │ John M.  │ john@... │ Editor │ ACTIVE │   12   │ [⋮]     │ ║
║  │ Sarah K. │ sarah@...│ Editor │ ACTIVE │   18   │ [⋮]     │ ║
║  │ David O. │ david@...│ Editor │INACTIVE│    0   │ [⋮]     │ ║
║  └──────────┴──────────┴────────┴────────┴────────┴─────────┘ ║
║                                                                ║
║  Showing 1-25 of 128 users                    [< 1 2 3 4 >]   ║
╚════════════════════════════════════════════════════════════════╝
```

**Actions Menu (⋮):**
- Activate / Deactivate
- Reset Password
- View Analytics

**Status Badges:**
- ACTIVE: Green background
- INACTIVE: Grey background

### 5.4 Individual Editor Analytics Page

**URL:** `/manager/analytics/editor/[editor_id]`

(See Section 4.4 for detailed specifications)

### 5.5 Audit History Tab

**Location:** Within claim detail view, as a tab alongside Digitization, Checklist, Clinical Validation, Review

**Tab Label:** "Audit History" (or "History" for brevity)

(See Section 4.7 for detailed specifications)

### 5.6 Responsive Design

**Breakpoints:**
- Desktop: ≥1200px (full layout)
- Tablet: 768px-1199px (adjusted card grids, stacked capacity cards)
- Mobile: <768px (single column, collapsible sidebar)

**Mobile Considerations:**
- Bulk operations simplified (select count badge, single "Reassign" button)
- Audit history table becomes card-based list view
- Capacity view becomes vertical scroll list

### 5.7 Accessibility (WCAG 2.1 AA)

**Requirements:**
- All interactive elements keyboard-navigable (Tab, Enter, Esc)
- Color contrast ratio ≥4.5:1 for all text
- Screen reader support (ARIA labels on all buttons, form fields)
- Focus indicators visible (blue outline on keyboard focus)
- Error messages announced to screen readers
- Form field labels explicitly associated

---

## 6. Data Model & Architecture

### 6.1 Database Schema Changes

**New/Modified Tables:**

#### 6.1.1 `users` Table (Enhanced)

| **Column** | **Type** | **Constraints** | **Description** |
|------------|----------|-----------------|-----------------|
| user_id | UUID | PRIMARY KEY | Unique user identifier |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email (lowercase) |
| role | ENUM('Editor', 'Manager') | NOT NULL | User role (mutually exclusive) |
| status | ENUM('ACTIVE', 'INACTIVE') | NOT NULL, DEFAULT 'ACTIVE' | User account status |
| password_hash | VARCHAR(255) | NOT NULL | Encrypted password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| created_by | UUID | FOREIGN KEY(users.user_id) | Manager who created account |
| deactivated_at | TIMESTAMP | NULL | Timestamp of deactivation |
| deactivated_by | UUID | FOREIGN KEY(users.user_id), NULL | Manager who deactivated account |
| last_login | TIMESTAMP | NULL | Last successful login |

**Indexes:**
- `idx_users_email` ON email
- `idx_users_status` ON status
- `idx_users_role` ON role

#### 6.1.2 `claims` Table (Enhanced)

| **Column** | **Type** | **Constraints** | **Description** |
|------------|----------|-----------------|-----------------|
| claim_id | VARCHAR(50) | PRIMARY KEY | Unique claim identifier |
| visit_number | VARCHAR(50) | NOT NULL | Patient visit number |
| assigned_user_id | UUID | FOREIGN KEY(users.user_id), NULL | Currently assigned editor/manager |
| edit_status | ENUM('PENDING', 'IN PROGRESS', 'ADJUDICATED', 'RE-ADJUDICATED', 'AUTOMATED') | NOT NULL | Current edit status |
| lct_submission_count | INT | NOT NULL, DEFAULT 0 | Number of times sent to LCT (max 3) |
| vetting_status | ENUM('PENDING', 'APPROVED', 'REJECTED', 'PARTIAL') | NULL | LCT final vetting status |
| vetting_received_at | TIMESTAMP | NULL | When vetting status received |
| assignment_timestamp | TIMESTAMP | NULL | When claim was assigned to current user |
| started_timestamp | TIMESTAMP | NULL | When user clicked "Save and Next" on first page |
| adjudication_timestamp | TIMESTAMP | NULL | When user submitted adjudication |
| force_reassigned | BOOLEAN | DEFAULT FALSE | Flag if claim was force reassigned |
| ...existing_columns... | | | (All existing claim fields preserved) |

**Indexes:**
- `idx_claims_assigned_user` ON assigned_user_id
- `idx_claims_edit_status` ON edit_status
- `idx_claims_lct_submission_count` ON lct_submission_count
- `idx_claims_vetting_status` ON vetting_status

#### 6.1.3 `audit_log` Table (New)

| **Column** | **Type** | **Constraints** | **Description** |
|------------|----------|-----------------|-----------------|
| log_id | UUID | PRIMARY KEY | Unique log entry identifier |
| claim_id | VARCHAR(50) | FOREIGN KEY(claims.claim_id), NOT NULL | Associated claim |
| event_type | VARCHAR(50) | NOT NULL | Type of event (see FR-7.3) |
| actor_id | UUID | FOREIGN KEY(users.user_id), NULL | User who performed action (NULL for system) |
| actor_type | ENUM('System', 'Editor', 'Manager') | NOT NULL | Type of actor |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | When event occurred |
| claim_status_after | VARCHAR(50) | NULL | Claim status after this event |
| event_data | JSONB | NOT NULL | Event-specific data (field changes, AI responses, etc.) |
| bulk_operation_id | UUID | NULL | Groups bulk operations |

**Indexes:**
- `idx_audit_claim` ON claim_id
- `idx_audit_timestamp` ON timestamp DESC
- `idx_audit_event_type` ON event_type
- `idx_audit_actor` ON actor_id

**Sample `event_data` JSON:**
```json
{
  "field_changed": {
    "field_name": "Diagnosis",
    "step": "Digitization",
    "previous_value": ["M00"],
    "new_value": ["M00", "M19.90"]
  },
  "reassignment": {
    "previous_assignee_id": "uuid1",
    "previous_assignee_name": "John Mwangi",
    "new_assignee_id": "uuid2",
    "new_assignee_name": "Sarah Kimani",
    "reason": "FORCE_REASSIGN"
  },
  "ai_adjudication": {
    "ai_version": 2,
    "decision": "PARTIAL",
    "approved_amount": 3500,
    "ai_response_payload": {...}
  }
}
```

#### 6.1.4 `password_reset_tokens` Table (New)

| **Column** | **Type** | **Constraints** | **Description** |
|------------|----------|-----------------|-----------------|
| token_id | UUID | PRIMARY KEY | Unique token identifier |
| user_id | UUID | FOREIGN KEY(users.user_id), NOT NULL | User requesting reset |
| token_hash | VARCHAR(255) | NOT NULL | Hashed reset token |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Token generation time |
| expires_at | TIMESTAMP | NOT NULL | Expiry (24 hours from creation) |
| used_at | TIMESTAMP | NULL | When token was used (NULL if unused) |
| initiated_by | UUID | FOREIGN KEY(users.user_id) | Manager who initiated reset |

**Indexes:**
- `idx_password_reset_user` ON user_id
- `idx_password_reset_expiry` ON expires_at

#### 6.1.5 `reassignment_history` Table (New - for analytics)

| **Column** | **Type** | **Constraints** | **Description** |
|------------|----------|-----------------|-----------------|
| reassignment_id | UUID | PRIMARY KEY | Unique reassignment identifier |
| claim_id | VARCHAR(50) | FOREIGN KEY(claims.claim_id), NOT NULL | Associated claim |
| previous_assignee_id | UUID | FOREIGN KEY(users.user_id), NOT NULL | User losing assignment |
| new_assignee_id | UUID | FOREIGN KEY(users.user_id), NOT NULL | User gaining assignment |
| reassigned_by | UUID | FOREIGN KEY(users.user_id), NOT NULL | Manager who reassigned |
| reassignment_type | ENUM('STANDARD', 'FORCE', 'BULK', 'AUTO_DEACTIVATION') | NOT NULL | Type of reassignment |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | When reassignment occurred |
| bulk_operation_id | UUID | NULL | Groups bulk operations |

**Indexes:**
- `idx_reassignment_previous` ON previous_assignee_id
- `idx_reassignment_new` ON new_assignee_id
- `idx_reassignment_timestamp` ON timestamp DESC

### 6.2 API Endpoints

**Base URL:** `/api/v1/manager`

#### 6.2.1 Readjudication Endpoints

**POST** `/claims/{claim_id}/re-edit`
- **Description:** Initiate re-edit process for a claim
- **Request Body:** None
- **Response:** Claim data for re-edit interface
- **Status Codes:** 200 OK, 403 Forbidden (at 3-attempt limit), 404 Not Found

**POST** `/claims/{claim_id}/re-edit/submit`
- **Description:** Submit manager re-adjudication
- **Request Body:**
  ```json
  {
    "adjudication_decision": "APPROVED | REJECTED | PARTIAL",
    "approved_amount": 4150.00,
    "adjudication_data": {...},
    "assign_to_editor_id": "uuid"
  }
  ```
- **Response:** Success message, updated claim status
- **Status Codes:** 201 Created, 400 Bad Request (validation error), 403 Forbidden

#### 6.2.2 Reassignment Endpoints

**POST** `/claims/{claim_id}/reassign`
- **Description:** Reassign single claim (standard or force)
- **Request Body:**
  ```json
  {
    "new_assignee_id": "uuid",
    "reassignment_type": "STANDARD | FORCE"
  }
  ```
- **Response:** Success message
- **Status Codes:** 200 OK, 400 Bad Request (validation error), 409 Conflict (claim started, cannot standard reassign)

**POST** `/claims/bulk-reassign`
- **Description:** Bulk reassign multiple claims
- **Request Body:**
  ```json
  {
    "claim_ids": ["claim_1", "claim_2", "claim_3"],
    "new_assignee_id": "uuid"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "reassigned_count": 8,
    "failed_claims": []
  }
  ```
- **Status Codes:** 200 OK, 400 Bad Request, 207 Multi-Status (partial success)

#### 6.2.3 User Management Endpoints

**GET** `/users`
- **Description:** List all users with filters
- **Query Parameters:** `role`, `status`, `search`, `page`, `limit`
- **Response:** Paginated user list
- **Status Codes:** 200 OK

**POST** `/users`
- **Description:** Create new user
- **Request Body:**
  ```json
  {
    "full_name": "John Mwangi",
    "email": "john.mwangi@example.com",
    "role": "Editor | Manager"
  }
  ```
- **Response:** Created user object + temporary password sent to email
- **Status Codes:** 201 Created, 400 Bad Request (validation error), 409 Conflict (email exists)

**PATCH** `/users/{user_id}/activate`
- **Description:** Activate inactive user
- **Request Body:** None
- **Response:** Success message
- **Status Codes:** 200 OK, 404 Not Found

**PATCH** `/users/{user_id}/deactivate`
- **Description:** Deactivate active user
- **Request Body:** None
- **Response:**
  ```json
  {
    "success": true,
    "claims_redistributed": 12
  }
  ```
- **Status Codes:** 200 OK, 404 Not Found

**POST** `/users/{user_id}/reset-password`
- **Description:** Initiate password reset
- **Request Body:** None
- **Response:** Success message (email sent)
- **Status Codes:** 200 OK, 404 Not Found

#### 6.2.4 Analytics Endpoints

**GET** `/analytics/editor/{editor_id}`
- **Description:** Get individual editor performance metrics
- **Query Parameters:** `start_date`, `end_date`, `period` (today, this_week, this_month, custom)
- **Response:**
  ```json
  {
    "editor": {...},
    "metrics": {
      "claims_assigned": 48,
      "adjudicated": 42,
      "pending": 4,
      "queried": 2,
      "approved": 8,
      "rejected": 2,
      "partial": 2,
      "manager_re_edits": 5,
      "vetting_approved": 28,
      "vetting_rejected": 8,
      "vetting_partial": 4,
      "vetting_pending": 2,
      "reassignment_count": 3
    },
    "trends": [...],
    "detailed_claims": [...]
  }
  ```
- **Status Codes:** 200 OK, 404 Not Found

#### 6.2.5 Capacity View Endpoints

**GET** `/capacity`
- **Description:** Get real-time capacity view for all editors
- **Response:**
  ```json
  {
    "editors": [
      {
        "editor_id": "uuid",
        "name": "John Mwangi",
        "assigned_not_started": 12,
        "total_assigned": 25,
        "load_percentage": 48
      },
      ...
    ],
    "last_updated": "2025-10-31T14:30:00Z"
  }
  ```
- **Status Codes:** 200 OK

**WebSocket:** `ws://api/v1/manager/capacity/live`
- **Description:** Real-time capacity updates
- **Message Format:**
  ```json
  {
    "type": "CAPACITY_UPDATE",
    "editor_id": "uuid",
    "assigned_not_started": 13,
    "total_assigned": 26
  }
  ```

#### 6.2.6 Audit History Endpoints

**GET** `/claims/{claim_id}/audit`
- **Description:** Get complete audit trail for claim
- **Query Parameters:** `event_type`, `actor_id`, `start_date`, `end_date`, `page`, `limit`
- **Response:**
  ```json
  {
    "claim_id": "CLM-28581",
    "total_events": 15,
    "events": [
      {
        "log_id": "uuid",
        "event_type": "EDITOR_ADJUDICATION",
        "actor": {
          "id": "uuid",
          "name": "Sarah Kimani",
          "type": "Editor"
        },
        "timestamp": "2025-10-31T14:30:12Z",
        "action_description": "Adjudication submitted (Attempt 2/3)",
        "details": {...},
        "claim_status_after": "ADJUDICATED"
      },
      ...
    ]
  }
  ```
- **Status Codes:** 200 OK, 404 Not Found

**GET** `/claims/{claim_id}/audit/export`
- **Description:** Export audit trail to CSV
- **Query Parameters:** Same as audit endpoint
- **Response:** CSV file download
- **Status Codes:** 200 OK, 404 Not Found

### 6.3 Integration Architecture

**Component Diagram:**

```
┌─────────────────┐
│  Edit Manager   │
│    Dashboard    │
│   (React App)   │
└────────┬────────┘
         │
         │ HTTPS/REST
         ↓
┌─────────────────┐      ┌─────────────────┐
│   Manager API   │←────→│   Database      │
│  (Node.js/     │      │   (PostgreSQL)  │
│   Express)      │      └─────────────────┘
└────────┬────────┘
         │
         ├──→ Notification Service (Email, MS Teams)
         ├──→ LCT Portal API (adjudication submission)
         ├──→ AI Adjudication Service (system reruns)
         └──→ WebSocket Server (real-time capacity)
```

**Key Integrations:**

1. **LCT Portal API**
   - Endpoint: `/api/lct/adjudication`
   - Method: POST
   - Payload: Adjudication data + metadata (attempt count, re-edited flag)
   - Authentication: API key

2. **Notification Service**
   - Email: SendGrid API
   - MS Teams: Webhook integration
   - Templates: User management, reassignment, re-edit notifications

3. **WebSocket Server**
   - Protocol: WSS (WebSocket Secure)
   - Events: Capacity updates, claim status changes
   - Heartbeat: 30-second ping/pong

4. **Audit Log Service**
   - Background worker: Processes audit events asynchronously
   - Queue: RabbitMQ or Redis for event buffering
   - Retention: 7 years for compliance

---

## 7. Business Rules & Logic

### 7.1 Re-Edit Limit Enforcement

**Rule:** A claim can be submitted to LCT a maximum of 3 times (including initial editor adjudication + manager re-edits)

**Implementation:**
```python
def can_re_edit(claim):
    return claim.lct_submission_count < 3

def submit_adjudication(claim, adjudicator):
    if claim.lct_submission_count >= 3:
        raise ValidationError("Maximum re-edit attempts reached")
    
    claim.lct_submission_count += 1
    send_to_lct(claim)
    
    if claim.lct_submission_count >= 3:
        disable_re_edit_button(claim)
```

### 7.2 Claim "Started" Definition

**Rule:** A claim is considered "started" when the user (editor or manager) clicks "Save and Next" on the first page (Patient Info, Claim & Policy Details)

**Implementation:**
```python
def mark_claim_started(claim, user):
    if claim.started_timestamp is None:
        claim.started_timestamp = datetime.now()
        claim.edit_status = 'IN PROGRESS'
        log_audit_event(
            event_type='CLAIM_STARTED',
            actor=user,
            claim=claim
        )
```

### 7.3 Round-Robin Assignment Algorithm

**Rule:** When claims are auto-assigned (initial assignment or redistribution after deactivation), use round-robin to balance load

**Implementation:**
```python
def get_next_assignee_round_robin():
    """
    Returns the active editor with the lowest current claim count.
    Breaks ties by last assignment timestamp (least recently assigned).
    """
    active_editors = User.query.filter_by(status='ACTIVE', role='Editor').all()
    
    editor_loads = []
    for editor in active_editors:
        claim_count = Claim.query.filter_by(
            assigned_user_id=editor.user_id,
            edit_status__in=['PENDING', 'IN PROGRESS', 'QUERIED']
        ).count()
        
        last_assigned = Assignment.query.filter_by(
            assignee_id=editor.user_id
        ).order_by(Assignment.timestamp.desc()).first()
        
        editor_loads.append({
            'editor': editor,
            'claim_count': claim_count,
            'last_assigned': last_assigned.timestamp if last_assigned else datetime.min
        })
    
    # Sort by claim count (ascending), then by last assigned (ascending)
    editor_loads.sort(key=lambda x: (x['claim_count'], x['last_assigned']))
    
    return editor_loads[0]['editor']
```

### 7.4 Force Reassignment Data Preservation

**Rule:** During force reassignment, all saved progress is preserved, but unsaved changes in the active editor's session are discarded

**Implementation:**
```python
def force_reassign(claim, current_editor, new_editor, manager):
    # Check if claim is in progress
    if claim.edit_status != 'IN PROGRESS':
        raise ValidationError("Force reassign only for in-progress claims")
    
    # Log current state before reassignment
    log_audit_event(
        event_type='CLAIM_FORCE_REASSIGNED',
        actor=manager,
        claim=claim,
        event_data={
            'previous_assignee_id': current_editor.user_id,
            'new_assignee_id': new_editor.user_id,
            'unsaved_changes_discarded': True,
            'saved_progress_preserved': True
        }
    )
    
    # Update assignment (saved data in database remains intact)
    claim.assigned_user_id = new_editor.user_id
    claim.assignment_timestamp = datetime.now()
    claim.force_reassigned = True
    
    # Notify editors
    notify_editor(current_editor, f"Claim {claim.claim_id} force reassigned")
    notify_editor(new_editor, f"Claim {claim.claim_id} assigned urgently")
    
    # If current editor has claim open in browser, send WebSocket message to close
    websocket_send(current_editor.user_id, {
        'type': 'FORCE_REASSIGNMENT',
        'claim_id': claim.claim_id,
        'redirect_to': '/dashboard'
    })
```

### 7.5 User Deactivation Claim Redistribution

**Rule:** When a user is deactivated, all their assigned claims (PENDING or IN PROGRESS) are automatically redistributed to active editors via round-robin

**Implementation:**
```python
def deactivate_user(user, manager):
    # Update user status
    user.status = 'INACTIVE'
    user.deactivated_at = datetime.now()
    user.deactivated_by = manager.user_id
    
    # Get all claims assigned to this user
    assigned_claims = Claim.query.filter_by(
        assigned_user_id=user.user_id,
        edit_status__in=['PENDING', 'IN PROGRESS', 'QUERIED']
    ).all()
    
    # Redistribute via round-robin
    redistributed_count = 0
    for claim in assigned_claims:
        new_assignee = get_next_assignee_round_robin()
        
        reassign_claim(
            claim=claim,
            previous_assignee=user,
            new_assignee=new_assignee,
            reason='USER_DEACTIVATION',
            triggered_by=manager
        )
        
        redistributed_count += 1
    
    return redistributed_count
```

### 7.6 Vetting Status Refresh Logic

**Rule:** LCT vetting status is refreshed for all submitted claims every 4 days via batch API call

**Implementation:**
```python
def refresh_vetting_statuses():
    """
    Background job runs every 4 days.
    Fetches latest vetting status from LCT API for all claims
    with vetting_status = 'PENDING'.
    """
    pending_claims = Claim.query.filter_by(
        vetting_status='PENDING'
    ).all()
    
    claim_ids = [c.claim_id for c in pending_claims]
    
    # Batch API call to LCT
    response = lct_api.get_vetting_statuses(claim_ids)
    
    for claim_id, vetting_data in response.items():
        claim = Claim.query.get(claim_id)
        
        if claim.vetting_status != vetting_data['status']:
            # Status changed, update and log
            claim.vetting_status = vetting_data['status']
            claim.vetting_received_at = datetime.now()
            
            log_audit_event(
                event_type='VETTING_STATUS_RECEIVED',
                actor=None,  # System/LCT
                actor_type='System',
                claim=claim,
                event_data={
                    'vetting_status': vetting_data['status'],
                    'received_at': datetime.now().isoformat()
                }
            )
```

### 7.7 Reassignment Count Calculation

**Rule:** For analytics, count the number of times claims were reassigned FROM an editor to others (not TO the editor)

**Implementation:**
```python
def get_reassignment_count(editor_id, start_date, end_date):
    """
    Counts reassignments FROM this editor in the given period.
    """
    return ReassignmentHistory.query.filter(
        ReassignmentHistory.previous_assignee_id == editor_id,
        ReassignmentHistory.timestamp >= start_date,
        ReassignmentHistory.timestamp <= end_date
    ).count()
```

---

## 8. Integration Requirements

### 8.1 LCT Portal Integration

**Integration Type:** REST API

**Endpoints:**

1. **Submit Adjudication**
   - **URL:** `POST https://lct-portal.vitraya.com/api/adjudication`
   - **Headers:** `Authorization: Bearer {API_KEY}`, `Content-Type: application/json`
   - **Request Payload:**
     ```json
     {
       "claim_id": "CLM-28581",
       "visit_number": "1369896",
       "adjudication_type": "INITIAL | RE_EDIT",
       "lct_submission_count": 2,
       "adjudicator": {
         "id": "uuid",
         "name": "John Mwangi",
         "role": "Manager"
       },
       "decision": "APPROVED | REJECTED | PARTIAL",
       "approved_amount": 4150.00,
       "adjudication_data": {...}
     }
     ```
   - **Response:**
     ```json
     {
       "success": true,
       "lct_entry_id": "uuid",
       "message": "Adjudication received"
     }
     ```
   - **Error Handling:** Retry 3 times with exponential backoff on 5xx errors

2. **Get Vetting Status (Batch)**
   - **URL:** `GET https://lct-portal.vitraya.com/api/vetting-status`
   - **Query Parameters:** `claim_ids[]` (array of claim IDs, max 100 per request)
   - **Response:**
     ```json
     {
       "CLM-28581": {
         "status": "APPROVED",
         "updated_at": "2025-10-31T15:45:23Z"
       },
       "CLM-28582": {
         "status": "PENDING",
         "updated_at": null
       }
     }
     ```

**Webhook (Inbound from LCT):**
- **URL:** `POST https://edit-portal.vitraya.com/api/webhooks/lct/vetting-status`
- **Authentication:** HMAC signature validation
- **Payload:**
  ```json
  {
    "claim_id": "CLM-28581",
    "vetting_status": "APPROVED | REJECTED | PARTIAL",
    "timestamp": "2025-10-31T15:45:23Z"
  }
  ```
- **Processing:** Update claim vetting status, create audit log entry

### 8.2 Notification Service Integration

**Email Service:** SendGrid

**Templates:**

1. **Welcome Email (New User)**
   - Template ID: `d-abc123`
   - Variables: `user_name`, `temporary_password`, `login_url`

2. **Password Reset**
   - Template ID: `d-def456`
   - Variables: `user_name`, `reset_link`, `expiry_hours`

3. **Claim Reassigned (Previous Assignee)**
   - Template ID: `d-ghi789`
   - Variables: `claim_id`, `new_assignee_name`, `manager_name`

4. **Claim Assigned (New Assignee)**
   - Template ID: `d-jkl012`
   - Variables: `claim_id`, `priority`, `manager_name`

5. **Account Deactivated**
   - Template ID: `d-mno345`
   - Variables: `user_name`, `deactivation_date`

6. **Account Reactivated**
   - Template ID: `d-pqr678`
   - Variables: `user_name`, `reset_link`

**MS Teams Integration:**

- **Webhook URL:** `https://teams.microsoft.com/api/incoming/webhook/...`
- **Message Format:** Adaptive Card JSON
- **Use Cases:**
  - Manager re-edit notifications to LCT team
  - High-priority claim assignments
  - System alerts (e.g., claims reaching 3/3 limit)

### 8.3 AI Adjudication Service Integration

**Trigger:** System rerun when editor/manager modifies diagnosis, adds bill items, or increases quantities

**Integration Type:** Internal microservice (gRPC or REST)

**Endpoint:**
- **URL:** `POST http://ai-service:8080/adjudication/rerun`
- **Payload:**
  ```json
  {
    "claim_id": "CLM-28581",
    "trigger_reason": "DIAGNOSIS_CHANGED | BILL_ITEMS_ADDED | QUANTITY_INCREASED",
    "updated_data": {...}
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "ai_version": 2,
    "adjudication_response": {...}
  }
  ```

**Audit Logging:** Each system rerun logged separately with AI version and response

---

## 9. Analytics & Reporting

### 9.1 Manager Analytics Dashboard (Overall)

**URL:** `/manager/analytics`

**Metrics Displayed:**

**Summary Cards (Top Row):**
- Total Claims (All Time)
- Claims Adjudicated This Week
- Average LCT Approval Rate (All Editors)
- Average Processing Time (This Month)

**Charts & Visualizations:**

1. **Claims Volume Trend**
   - Chart Type: Line chart
   - X-Axis: Date (daily granularity, last 30 days)
   - Y-Axis: Number of claims adjudicated
   - Data Series: All editors combined

2. **Editor Performance Comparison**
   - Chart Type: Horizontal bar chart
   - X-Axis: Number of claims adjudicated (this week)
   - Y-Axis: Editor names
   - Color Coding: Green (high performers), Yellow (average), Red (below average)

3. **LCT Vetting Status Distribution**
   - Chart Type: Pie chart
   - Slices: Approved, Rejected, Partial, Pending
   - Center Label: Total claims with vetting status

4. **Re-Edit Frequency**
   - Chart Type: Table
   - Columns: Editor Name, Claims Adjudicated, Manager Re-Edits, Re-Edit %
   - Sorting: Descending by Re-Edit %

**Filters:**
- Date Range: Today, This Week, This Month, Last 30 Days, Custom
- Editor: All / Specific Editor

**Export:** PDF report generation

### 9.2 Individual Editor Analytics

(See Section 4.4 for complete specifications)

### 9.3 Audit Reports

**Report Types:**

1. **User Activity Report**
   - **Parameters:** User ID, Date Range
   - **Contents:** All actions performed by user (adjudications, reassignments, re-edits)
   - **Format:** PDF with tabular data

2. **Claim Lifecycle Report**
   - **Parameters:** Claim ID
   - **Contents:** Complete audit trail (formatted chronologically)
   - **Format:** PDF with timeline visualization

3. **Compliance Report**
   - **Parameters:** Date Range
   - **Contents:** All claims reaching 3/3 re-edit limit, force reassignments, deactivations
   - **Format:** Excel spreadsheet

---

## 10. Security & Access Control

### 10.1 Authentication & Authorization

**Authentication Method:** JWT (JSON Web Tokens)

**Token Expiry:** 8 hours (access token), 30 days (refresh token)

**Role-Based Access Control (RBAC):**

| **Feature** | **Editor** | **Manager** |
|-------------|------------|-------------|
| View Claims Dashboard | ✓ (own claims only) | ✓ (all claims) |
| Edit Claims | ✓ | ✓ (via re-edit) |
| Re-Edit Claims | ✗ | ✓ |
| Reassign Claims | ✗ | ✓ |
| Bulk Reassign | ✗ | ✓ |
| View Analytics (Own) | ✓ | ✓ |
| View Analytics (All Editors) | ✗ | ✓ |
| User Management | ✗ | ✓ |
| View Audit History (Own Claims) | ✓ | ✓ |
| View Audit History (All Claims) | ✗ | ✓ |
| Access Capacity View | ✗ | ✓ |

**API Authorization:**
- All `/api/v1/manager/*` endpoints require `role=Manager` in JWT
- Attempt to access manager endpoints with editor token → 403 Forbidden

### 10.2 Data Security

**Password Security:**
- **Hashing:** bcrypt with salt rounds = 12
- **Minimum Complexity:** 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
- **Reset Token:** SHA-256 hashed, 256-bit entropy, 24-hour expiry

**Data Encryption:**
- **In Transit:** TLS 1.3 for all HTTPS connections
- **At Rest:** Database-level encryption (AES-256) for sensitive fields (passwords, tokens)

**API Security:**
- **Rate Limiting:** 100 requests/minute per user (configurable)
- **CORS:** Whitelist only authorized domains
- **CSRF Protection:** CSRF tokens for all state-changing operations

### 10.3 Audit & Compliance

**Audit Log Retention:** 7 years (regulatory requirement)

**Access Logging:** All manager actions logged with timestamp, IP address, user agent

**Sensitive Data Handling:**
- PHI (Protected Health Information) redacted in non-clinical contexts (e.g., analytics exports)
- Audit logs do not include patient names in non-encrypted form

**Compliance Standards:**
- **HIPAA:** PHI protection, audit trails, access controls
- **GDPR:** Data subject rights (if applicable), consent management

---

## 11. Performance Requirements

### 11.1 Response Time SLAs

| **Operation** | **Target Response Time** | **P95** | **P99** |
|---------------|--------------------------|---------|---------|
| Load claims grid (100 claims) | <1 second | 1.5s | 2s |
| Re-edit claim (load claim data) | <2 seconds | 3s | 4s |
| Submit re-adjudication | <3 seconds | 4s | 5s |
| Reassign single claim | <500ms | 800ms | 1s |
| Bulk reassign (50 claims) | <5 seconds | 7s | 10s |
| Load individual analytics | <2 seconds | 3s | 4s |
| Real-time capacity view update | <1 second | 1.5s | 2s |
| Load audit history (<50 events) | <1 second | 1.5s | 2s |
| User management operations | <1 second | 1.5s | 2s |

### 11.2 Scalability

**Concurrent Users:** Support 50 managers + 200 editors simultaneously

**Claims Volume:** Handle 10,000+ claims in system (any status)

**Audit Log Volume:** Support 1 million+ audit entries with <2 second query time

**WebSocket Connections:** Maintain 50 concurrent WebSocket connections for capacity view

### 11.3 Database Optimization

**Indexing Strategy:**
- All foreign keys indexed
- Composite index on (assigned_user_id, edit_status) for capacity queries
- Composite index on (claim_id, timestamp) for audit queries

**Query Optimization:**
- Use database views for complex analytics queries
- Implement query result caching (Redis) for analytics (5-minute TTL)

**Connection Pooling:**
- Min connections: 10
- Max connections: 100
- Connection timeout: 30 seconds

---

## 12. Edge Cases & Error Handling

### 12.1 Concurrent Modification Scenarios

| **Scenario** | **Detection** | **Resolution** |
|--------------|---------------|----------------|
| Editor completes claim while manager initiates re-edit | Server-side status check before allowing re-edit | Show error: "Claim has been completed and cannot be re-edited" |
| Two managers attempt to re-edit same claim simultaneously | Database row-level locking | First commits wins; second receives error: "Claim is already being re-edited by another manager" |
| Manager reassigns claim while editor is saving | Transaction isolation (SERIALIZABLE) | If editor's save timestamp < reassignment timestamp, allow save; otherwise, discard and notify editor |
| Bulk reassignment while individual reassignment in progress | Batch operation checks each claim's current state | Skip claims that changed state; show partial success message |

### 12.2 Network & System Failures

| **Failure Type** | **User Experience** | **System Behavior** |
|------------------|---------------------|---------------------|
| WebSocket disconnection (capacity view) | Yellow "Reconnecting..." indicator | Auto-reconnect with exponential backoff (max 5 attempts); fallback to 30s polling |
| API timeout during bulk reassignment | Loading spinner + "Operation taking longer than expected" message | Continue background processing; send email notification on completion |
| Database connection loss | Error modal: "System temporarily unavailable" | Circuit breaker pattern; retry after 5 seconds; escalate to admin if >3 failures |
| LCT API unavailable during adjudication submission | Warning: "Adjudication saved locally, will retry submission automatically" | Queue adjudication for background retry (every 5 minutes, max 24 hours) |

### 12.3 Data Validation Errors

| **Error Condition** | **User Feedback** | **Prevention** |
|--------------------|-------------------|----------------|
| Email already exists (user creation) | Inline error below email field: "This email is already registered" | Real-time validation on blur |
| Invalid email format | Inline error: "Please enter a valid email address" | Client-side regex validation |
| Reassignment to deactivated user | Dropdown excludes inactive users | Server-side status check |
| Bulk reassign with 0 claims selected | Button disabled + tooltip: "Select at least one claim" | Client-side state check |
| Force reassign on completed claim | Modal: "This claim has been completed and cannot be reassigned" | Server-side status validation |

### 12.4 Business Logic Violations

| **Violation** | **Detection** | **User Feedback** |
|---------------|---------------|-------------------|
| Attempt to re-edit claim at 3/3 limit | Button disabled + tooltip | "Maximum re-edit attempts reached (3/3)" |
| Manager assigns to self | Dropdown excludes manager's own name | N/A (not possible in UI) |
| Bulk reassign includes "started" claims | Checkboxes disabled for started claims | Tooltip: "Cannot bulk reassign started claims" |
| Password reset for non-existent user | Generic success message (security) | "If this email exists, a reset link has been sent" (prevent email enumeration) |

---

## 13. Acceptance Criteria

### 13.1 Feature-Level Acceptance Criteria

**Feature 1: Readjudication**
- ✅ Manager can click "Re-Edit" button on adjudicated claims
- ✅ Re-Edit button disabled after 3 LCT submissions
- ✅ Manager completes full 4-step edit workflow
- ✅ Post-submission, manager assigns claim to editor via dropdown
- ✅ LCT submission count increments correctly (1→2→3)
- ✅ Status changes to "RE-ADJUDICATED" after manager submission
- ✅ Previous editor's work preserved in audit trail
- ✅ Timer restarts for manager and subsequent editor
- ✅ LCT receives new adjudication entry with attempt count

**Feature 2: Reassignment**
- ✅ Manager can reassign "not started" claims (Edit Status = PENDING)
- ✅ "Reassign" button disabled for started claims
- ✅ Force reassign shows double confirmation modal
- ✅ Force reassign displays warning about discarding unsaved changes
- ✅ Previous and new assignees receive email + in-app notifications
- ✅ Audit log captures reassignment with all metadata
- ✅ If editor has claim open during force reassign, browser shows alert and redirects

**Feature 3: User Management**
- ✅ Manager can create user with Name, Email, Role
- ✅ Email uniqueness enforced (show error if exists)
- ✅ Welcome email sent with temporary password
- ✅ Manager can activate/deactivate users
- ✅ Deactivated user's claims auto-redistribute via round-robin
- ✅ Manager can trigger password reset (sends email with link)
- ✅ Password reset link expires after 24 hours
- ✅ User list displays all users with filters (Role, Status)
- ✅ No "Remove" button exists (users cannot be deleted)

**Feature 4: Individual Editor Analytics**
- ✅ "View Analytics" button redirects to individual analytics page
- ✅ Page shows: Claims Assigned, Adjudicated, Pending, Queried
- ✅ Pie chart displays Approved, Rejected, Partially Approved %
- ✅ Quality section shows Manager Re-Edits count and %
- ✅ Vetting Status breakdown shows Approved, Rejected, Partial, Pending counts
- ✅ Reassignment count displayed
- ✅ Date range filters work correctly (default: This Week)
- ✅ Export to PDF generates formatted report

**Feature 5: Bulk Reassignment**
- ✅ Checkboxes appear in first column of claims grid
- ✅ "Started" claims have disabled checkboxes
- ✅ Selection counter updates: "X claims selected"
- ✅ Bulk action toolbar appears when ≥1 claim selected
- ✅ "Assign To" dropdown shows active editors with queue counts
- ✅ Confirmation modal shows count of claims to be reassigned
- ✅ Bulk operation respects "claim started" rule (no force reassign)
- ✅ Success message shows number of claims reassigned
- ✅ Audit log contains individual entries per claim with bulk_operation_id

**Feature 6: Real-Time Capacity View**
- ✅ Dashboard section shows all editors with assigned-not-started counts
- ✅ Load bar color-coded (green→yellow→orange→red)
- ✅ Clicking editor name redirects to filtered claims grid
- ✅ Real-time updates (<1 second latency) via WebSocket
- ✅ "Reassign" action available from capacity card
- ✅ Fallback to 30s polling if WebSocket unavailable

**Feature 7: Audit History**
- ✅ "Audit History" tab available in claim detail view
- ✅ Table displays: Timestamp, Event Type, Actor, Action, Details, Status
- ✅ Events sorted by timestamp descending (latest first)
- ✅ Every field change logged with before/after values
- ✅ AI system reruns logged separately with version numbers
- ✅ Multiple adjudications logged as separate entries
- ✅ Vetting status receipt logged with timestamp
- ✅ Force reassignment logged with "unsaved changes discarded" flag
- ✅ Filters work correctly (Event Type, Actor, Date Range)
- ✅ Export to CSV downloads full audit trail

### 13.2 Non-Functional Acceptance Criteria

**Performance:**
- ✅ Claims grid loads <1 second for 100 claims
- ✅ Re-edit workflow loads <2 seconds
- ✅ Bulk reassign (50 claims) completes <5 seconds
- ✅ Real-time capacity view updates <1 second
- ✅ Individual analytics loads <2 seconds

**Security:**
- ✅ Manager endpoints return 403 for editor tokens
- ✅ Passwords hashed with bcrypt (salt rounds = 12)
- ✅ JWT tokens expire after 8 hours
- ✅ All API calls use HTTPS/TLS 1.3
- ✅ Audit logs retained for 7 years

**Usability:**
- ✅ All interactive elements keyboard-navigable
- ✅ Color contrast ≥4.5:1 (WCAG AA)
- ✅ Error messages clear and actionable
- ✅ Confirmation dialogs for destructive actions (force reassign, deactivate)
- ✅ Loading states visible for async operations

**Reliability:**
- ✅ System handles 50 concurrent managers + 200 editors
- ✅ WebSocket auto-reconnects on connection loss
- ✅ Failed LCT API calls retry with exponential backoff
- ✅ Database transactions rollback on errors (no partial state)

---

## 14. Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)

**Sprint 1 Deliverables:**
- Database schema changes (users table enhancements, audit_log table, reassignment_history table)
- User authentication & authorization (JWT implementation, RBAC)
- Manager dashboard skeleton (layout, navigation, sidebar)

**Sprint 2 Deliverables:**
- Audit logging service (background worker, event processing)
- WebSocket server for real-time updates
- Base API endpoints structure

---

### Phase 2: User Management (Weeks 3-4)

**Sprint 3 Deliverables:**
- User CRUD operations (Create, Activate, Deactivate)
- Password reset workflow (email integration, token generation)
- User list page with filters
- Round-robin redistribution on deactivation

**Sprint 4 Deliverables:**
- Email notification service integration (SendGrid templates)
- User management audit logging
- Unit tests for user management logic

---

### Phase 3: Reassignment Features (Weeks 5-6)

**Sprint 5 Deliverables:**
- Standard reassignment (single claim)
- Force reassignment with double confirmation
- Reassignment notifications (email + in-app)
- Reassignment audit logging

**Sprint 6 Deliverables:**
- Bulk reassignment (checkbox selection, bulk toolbar)
- Bulk reassignment validation (skip started claims)
- Bulk operation audit logging
- Unit & integration tests for reassignment

---

### Phase 4: Readjudication (Weeks 7-8)

**Sprint 7 Deliverables:**
- Re-Edit button implementation (claims grid + detail view)
- LCT submission count tracking
- Re-edit workflow (full 4-step interface reuse)
- Post-submission assignment modal

**Sprint 8 Deliverables:**
- LCT API integration (adjudication submission)
- Status management (RE-ADJUDICATED status)
- 3-attempt limit enforcement
- Timer restart logic
- Unit tests for re-edit logic

---

### Phase 5: Analytics & Capacity View (Weeks 9-10)

**Sprint 9 Deliverables:**
- Real-time capacity view (WebSocket implementation)
- Individual editor analytics page (metrics calculation)
- Analytics charts (pie chart, line chart, cards)
- Date range filters

**Sprint 10 Deliverables:**
- Analytics export (PDF generation)
- Capacity view drill-down to claims grid
- Analytics caching (Redis) for performance
- Unit tests for analytics calculations

---

### Phase 6: Audit History (Weeks 11-12)

**Sprint 11 Deliverables:**
- Audit history display (tabular view, sorting)
- Field-level change tracking
- AI response versioning
- Expandable details

**Sprint 12 Deliverables:**
- Audit history filters (Event Type, Actor, Date Range)
- Export to CSV
- Pagination for large audit logs
- Unit tests for audit queries

---

### Phase 7: Integration & Testing (Weeks 13-14)

**Sprint 13 Deliverables:**
- LCT Portal integration testing
- End-to-end testing (full workflows)
- Performance testing (load testing, stress testing)
- Security testing (penetration testing, vulnerability scanning)

**Sprint 14 Deliverables:**
- User acceptance testing (UAT) with managers
- Bug fixes from UAT
- Documentation (user guide, API docs)
- Deployment preparation

---

### Phase 8: Deployment & Rollout (Weeks 15-16)

**Sprint 15 Deliverables:**
- Staging deployment
- Data migration (if needed)
- Training sessions for managers
- Deployment runbook

**Sprint 16 Deliverables:**
- Production deployment
- Post-deployment monitoring
- Hypercare support (24/7 for first week)
- Retrospective

---

## 15. Appendix

### 15.1 Glossary

| **Term** | **Definition** |
|----------|----------------|
| **Edit Manager** | User role with supervisory access to re-adjudicate, reassign claims, and manage editors |
| **Readjudication (Re-Edit)** | Process of manager reviewing and resubmitting a claim to LCT (max 3 submissions total) |
| **LCT (Life Care Team)** | Team that handles complex claims and provides final vetting status |
| **Vetting Status** | Final approval status from LCT (Approved, Rejected, Partial, Pending) |
| **LCT Submission Count** | Number of times claim has been sent to LCT (includes editor adjudication + manager re-edits) |
| **Claim Started** | State when user clicks "Save and Next" on first page (Patient Info, Claim & Policy Details) |
| **Force Reassign** | Reassignment of in-progress claim, discarding unsaved changes |
| **Round-Robin** | Load balancing algorithm that distributes claims evenly across active editors |
| **Audit Trail** | Complete chronological log of all actions performed on a claim |
| **Capacity View** | Real-time dashboard showing unstarted claim counts per editor |

### 15.2 Assumptions

1. All managers have medical/clinical background to perform re-adjudications
2. Editors use modern web browsers (Chrome, Firefox, Edge, Safari - last 2 versions)
3. LCT API is available and reliable (>99% uptime)
4. Email delivery service (SendGrid) is configured and operational
5. Database supports row-level locking and ACID transactions
6. Network latency between Edit Portal and LCT Portal <100ms
7. Managers have adequate training on system workflows before go-live

### 15.3 Constraints

1. **Technical Constraints:**
   - Maximum 3 LCT submissions per claim (hard business rule, no override)
   - WebSocket connection limit: 50 concurrent connections
   - Bulk operations limited to 100 claims per request
   - Audit log queries limited to 500 events per response (pagination required)

2. **Regulatory Constraints:**
   - HIPAA compliance mandatory for all PHI handling
   - Audit logs must be retained for 7 years
   - User passwords cannot be viewable by managers (reset only)

3. **Business Constraints:**
   - Only 2 roles supported: Editor and Manager (no hierarchy)
   - Users cannot be deleted once created (deactivation only)
   - Manager cannot assign claims to themselves

### 15.4 Open Questions (Resolved)

All questions from Section "Clarifying Questions Before Building PRD" have been answered and documented in this PRD.

### 15.5 Success Criteria Summary

**Quantitative:**
- ✅ 100% of manager re-edits logged in audit trail
- ✅ Bulk reassignment reduces manager workload by 70% (vs individual reassignment)
- ✅ Real-time capacity view enables workload balancing decisions in <30 seconds
- ✅ Vetting status refresh completes for 1000+ claims in <5 minutes
- ✅ Zero PHI data breaches or unauthorized access incidents

**Qualitative:**
- ✅ Managers report "easy" or "very easy" workflow (user survey score >4/5)
- ✅ Editors report timely and fair workload distribution (survey score >4/5)
- ✅ Audit team confirms complete traceability for compliance audits
- ✅ LCT team confirms reduced duplicate adjudication entries

---