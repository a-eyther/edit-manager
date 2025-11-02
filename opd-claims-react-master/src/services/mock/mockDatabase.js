/**
 * Mock In-Memory Database
 *
 * Provides realistic seed data and CRUD operations for Edit Manager features.
 * Data persists only for current browser session (resets on page refresh).
 *
 * Features:
 * - 50+ realistic claims with varying statuses
 * - 10+ users (editors and managers)
 * - Assignment tracking
 * - Comprehensive audit log
 * - Notification system
 */

import {
  UserRole,
  UserStatus,
  EditStatus,
  AuditEventType,
  NotificationType
} from '../../types/api-contracts';

// ==================== SEED DATA ====================

/**
 * Generate unique ID
 */
let idCounter = 1000;
const generateId = (prefix = 'ID') => `${prefix}-${idCounter++}`;

/**
 * Realistic Indian names for mock data
 */
const EDITOR_NAMES = [
  'Priya Sharma',
  'Rahul Verma',
  'Anita Patel',
  'Vijay Kumar',
  'Neha Reddy',
  'Amit Singh',
  'Kavita Desai',
  'Rajesh Iyer',
  'Sneha Nair',
  'Arjun Mehta',
  'Pooja Gupta',
  'Sanjay Pillai'
];

const MANAGER_NAMES = [
  'Dr. Suresh Menon',
  'Dr. Lakshmi Krishnan'
];

const HOSPITAL_NAMES = [
  'Apollo Hospitals',
  'Fortis Healthcare',
  'Max Healthcare',
  'Manipal Hospital',
  'Narayana Health',
  'Columbia Asia',
  'Medanta',
  'AIIMS Delhi',
  'Lilavati Hospital',
  'Jaslok Hospital'
];

const PATIENT_FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai',
  'Aadhya', 'Ananya', 'Diya', 'Isha', 'Kavya',
  'Rohan', 'Karan', 'Nikhil', 'Ravi', 'Suresh',
  'Priya', 'Meera', 'Anjali', 'Deepa', 'Sunita'
];

const PATIENT_LAST_NAMES = [
  'Kumar', 'Singh', 'Patel', 'Sharma', 'Verma',
  'Reddy', 'Nair', 'Iyer', 'Gupta', 'Desai',
  'Mehta', 'Shah', 'Joshi', 'Pillai', 'Rao'
];

/**
 * Helper: Random element from array
 */
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Helper: Random integer between min and max (inclusive)
 */
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Helper: Random date within last N days
 */
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date.toISOString();
};

/**
 * Helper: Generate realistic claim amounts
 */
const generateAmounts = () => {
  const requestAmount = randomInt(5000, 150000);
  const approvedAmount = Math.floor(requestAmount * (randomInt(60, 95) / 100));
  return { requestAmount, approvedAmount };
};

// ==================== DATA STORES ====================

/**
 * Users collection (Editors and Managers)
 */
export const users = [];

/**
 * Claims collection
 */
export const claims = [];

/**
 * Assignments tracking
 */
export const assignments = [];

/**
 * Audit log entries
 */
export const auditLog = [];

/**
 * Notifications
 */
export const notifications = [];

// ==================== SEED FUNCTIONS ====================

/**
 * Initialize users
 */
const seedUsers = () => {
  // Create managers
  MANAGER_NAMES.forEach((name, index) => {
    users.push({
      id: `MGR-${1000 + index}`,
      email: name.toLowerCase().replace('dr. ', '').replace(' ', '.') + '@hospital.com',
      name: name,
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      claimsAssigned: 0,
      lastLogin: randomDate(3),
      createdAt: randomDate(180),
      updatedAt: randomDate(7)
    });
  });

  // Create editors
  EDITOR_NAMES.forEach((name, index) => {
    const isActive = index < 10; // First 10 active, rest inactive for testing
    users.push({
      id: `EDR-${2000 + index}`,
      email: name.toLowerCase().replace(' ', '.') + '@hospital.com',
      name: name,
      role: UserRole.EDITOR,
      status: isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      claimsAssigned: 0, // Will be calculated
      lastLogin: isActive ? randomDate(1) : randomDate(30),
      createdAt: randomDate(180),
      updatedAt: randomDate(7)
    });
  });
};

/**
 * Initialize claims with realistic distribution
 */
const seedClaims = () => {
  const activeEditors = users.filter(u => u.role === UserRole.EDITOR && u.status === UserStatus.ACTIVE);

  // ===== ADD 4 EXAMPLE CLAIMS FOR MENU STATE DEMONSTRATION =====
  // These claims demonstrate all 4 menu states: UNASSIGNED, PENDING, ADJUDICATED, IN_PROGRESS
  // Using unshift() to prepend claims to beginning of array

  const sampleEditor = activeEditors.length > 0 ? activeEditors[0] : null;
  const now = new Date();
  const recentDate = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

  const demoClaims = [
    // Example 1: UNASSIGNED claim
    {
      id: 'CLM-DEMO-001',
      visitNumber: 'VN-DEMO-001',
      patientName: 'Demo Patient Alpha',
      hospitalName: 'Apollo Hospitals',
      editStatus: 'UNASSIGNED', // String to match other claims
      assignedTo: null,
      assignedToName: null,
      lctSubmissionCount: 0,
      requestAmount: 25000,
      approvedAmount: null,
      createdAt: recentDate.toISOString(),
      updatedAt: recentDate.toISOString(),
      timeElapsed: null,
      documents: [
        {
          id: 'DOC-DEMO-001-1',
          filename: 'sample-invoice.pdf',
          path: '/documents/sample-invoice.pdf',
          pages: 5,
          size: 512000,
          type: 'application/pdf',
          uploadedAt: recentDate.toISOString()
        }
      ]
    },
    // Example 2: PENDING claim (assigned but not started)
    {
      id: 'CLM-DEMO-002',
      visitNumber: 'VN-DEMO-002',
      patientName: 'Demo Patient Beta',
      hospitalName: 'Fortis Healthcare',
      editStatus: 'PENDING',
      assignedTo: sampleEditor?.id || null,
      assignedToName: sampleEditor?.name || null,
      lctSubmissionCount: 0,
      requestAmount: 18000,
      approvedAmount: null,
      createdAt: recentDate.toISOString(),
      updatedAt: recentDate.toISOString(),
      timeElapsed: 45, // 45 minutes since assignment
      documents: [
        {
          id: 'DOC-DEMO-002-1',
          filename: 'sample-invoice1.pdf',
          path: '/documents/sample-invoice1.pdf',
          pages: 3,
          size: 420000,
          type: 'application/pdf',
          uploadedAt: recentDate.toISOString()
        }
      ]
    },
    // Example 3: ADJUDICATED claim (completed work)
    {
      id: 'CLM-DEMO-003',
      visitNumber: 'VN-DEMO-003',
      patientName: 'Demo Patient Gamma',
      hospitalName: 'Max Healthcare',
      editStatus: 'ADJUDICATED',
      assignedTo: sampleEditor?.id || null,
      assignedToName: sampleEditor?.name || null,
      lctSubmissionCount: 1, // Less than 3, so re-edit is allowed
      requestAmount: 32000,
      approvedAmount: 28500,
      createdAt: recentDate.toISOString(),
      updatedAt: recentDate.toISOString(),
      timeElapsed: null,
      documents: [
        {
          id: 'DOC-DEMO-003-1',
          filename: 'sample-invoice.pdf',
          path: '/documents/sample-invoice.pdf',
          pages: 5,
          size: 650000,
          type: 'application/pdf',
          uploadedAt: recentDate.toISOString()
        }
      ]
    },
    // Example 4: IN_PROGRESS claim (actively being worked on)
    {
      id: 'CLM-DEMO-004',
      visitNumber: 'VN-DEMO-004',
      patientName: 'Demo Patient Delta',
      hospitalName: 'Manipal Hospital',
      editStatus: 'IN_PROGRESS',
      assignedTo: sampleEditor?.id || null,
      assignedToName: sampleEditor?.name || null,
      lctSubmissionCount: 0,
      requestAmount: 45000,
      approvedAmount: null,
      createdAt: recentDate.toISOString(),
      updatedAt: recentDate.toISOString(),
      timeElapsed: 120, // 2 hours since started
      documents: [
        {
          id: 'DOC-DEMO-004-1',
          filename: 'sample-invoice1.pdf',
          path: '/documents/sample-invoice1.pdf',
          pages: 3,
          size: 580000,
          type: 'application/pdf',
          uploadedAt: recentDate.toISOString()
        }
      ]
    }
  ];

  // Prepend demo claims to beginning of array
  claims.unshift(...demoClaims);

  // ===== END EXAMPLE CLAIMS =====

  // Status distribution (reduced to 6 regular claims + 4 demo = 10 total)
  const statusDistribution = [
    { status: EditStatus.PENDING, count: 2 },
    { status: EditStatus.IN_PROGRESS, count: 2 },
    { status: EditStatus.ADJUDICATED, count: 2 },
    { status: EditStatus.RE_ADJUDICATED, count: 0 },
    { status: EditStatus.AUTOMATED, count: 0 }
  ];

  let claimCounter = 3000;

  statusDistribution.forEach(({ status, count }) => {
    for (let i = 0; i < count; i++) {
      const claimId = `CLM-${claimCounter++}`;
      const { requestAmount, approvedAmount } = generateAmounts();

      // LCT submission count: weighted distribution
      let lctSubmissionCount = 1;
      if (status === EditStatus.ADJUDICATED || status === EditStatus.RE_ADJUDICATED) {
        const rand = Math.random();
        if (rand < 0.7) lctSubmissionCount = 1; // 70% have count 1
        else if (rand < 0.9) lctSubmissionCount = 2; // 20% have count 2
        else lctSubmissionCount = 3; // 10% have count 3 (max reached)
      }

      // Assign to random active editor (or null for automated)
      let assignedTo = null;
      let assignedToName = null;
      if (status !== EditStatus.AUTOMATED && activeEditors.length > 0) {
        const editor = randomFrom(activeEditors);
        assignedTo = editor.id;
        assignedToName = editor.name;
      }

      // Time elapsed (minutes since assignment)
      let timeElapsed = null;
      if (status === EditStatus.IN_PROGRESS) {
        timeElapsed = randomInt(1, 360); // 1-360 minutes (up to 6 hours)
      } else if (status === EditStatus.PENDING && assignedTo) {
        timeElapsed = randomInt(1, 120); // Pending but assigned
      }

      const createdAt = randomDate(30);

      // Generate realistic document array
      const documentCount = randomInt(1, 3); // 1-3 documents per claim
      const documents = [];
      const availableDocs = ['sample-invoice.pdf', 'sample-invoice1.pdf'];

      for (let docIdx = 0; docIdx < documentCount; docIdx++) {
        const docName = availableDocs[docIdx % availableDocs.length];
        documents.push({
          id: `DOC-${claimCounter}-${docIdx + 1}`,
          filename: docName,
          path: `/documents/${docName}`,
          pages: docIdx === 0 ? 5 : 3,
          size: randomInt(200, 800) * 1024, // 200-800 KB
          type: 'application/pdf',
          uploadedAt: createdAt
        });
      }

      claims.push({
        id: claimId,
        visitNumber: `VN-${10000 + claimCounter}`,
        patientName: `${randomFrom(PATIENT_FIRST_NAMES)} ${randomFrom(PATIENT_LAST_NAMES)}`,
        hospitalName: randomFrom(HOSPITAL_NAMES),
        editStatus: status,
        assignedTo,
        assignedToName,
        lctSubmissionCount,
        requestAmount,
        approvedAmount: status === EditStatus.ADJUDICATED || status === EditStatus.RE_ADJUDICATED ? approvedAmount : null,
        createdAt,
        updatedAt: randomDate(5),
        timeElapsed,
        documents // Add documents array to claim
      });

      // Create assignment record
      if (assignedTo) {
        assignments.push({
          id: generateId('ASG'),
          claimId,
          userId: assignedTo,
          assignedAt: createdAt,
          assignedBy: randomFrom(users.filter(u => u.role === UserRole.MANAGER)).id
        });
      }
    }
  });

  // Update user claim counts
  activeEditors.forEach(editor => {
    editor.claimsAssigned = assignments.filter(a => a.userId === editor.id).length;
  });
};

/**
 * Initialize audit log with historical events
 */
const seedAuditLog = () => {
  const managers = users.filter(u => u.role === UserRole.MANAGER);

  claims.forEach((claim, index) => {
    // AI Adjudication (first event for every claim)
    auditLog.push({
      id: generateId('AUD'),
      eventType: AuditEventType.AI_ADJUDICATION,
      claimId: claim.id,
      userId: null,
      userName: null,
      performedBy: 'SYSTEM',
      performedByName: 'AI System',
      timestamp: claim.createdAt,
      details: {
        decision: 'APPROVED',
        confidence: (Math.random() * 0.15 + 0.85).toFixed(2), // 0.85-1.00
        recommendedAmount: Math.floor(claim.requestAmount * 0.95),
        requestAmount: claim.requestAmount,
        processingTime: `${(Math.random() * 3 + 1).toFixed(1)}s`,
        riskScore: (Math.random() * 0.3).toFixed(2), // 0.00-0.30 (low risk)
        flaggedItems: []
      }
    });

    // Initial assignment
    if (claim.assignedTo) {
      auditLog.push({
        id: generateId('AUD'),
        eventType: AuditEventType.CLAIM_ASSIGNED,
        claimId: claim.id,
        userId: claim.assignedTo,
        userName: claim.assignedToName,
        performedBy: randomFrom(managers).id,
        performedByName: randomFrom(managers).name,
        timestamp: claim.createdAt,
        details: {
          visitNumber: claim.visitNumber,
          patientName: claim.patientName
        }
      });
    }

    // Adjudication events
    if (claim.editStatus === EditStatus.ADJUDICATED) {
      auditLog.push({
        id: generateId('AUD'),
        eventType: AuditEventType.CLAIM_ADJUDICATED,
        claimId: claim.id,
        userId: claim.assignedTo,
        userName: claim.assignedToName,
        performedBy: claim.assignedTo,
        performedByName: claim.assignedToName,
        timestamp: claim.updatedAt,
        details: {
          decision: randomFrom(['APPROVED', 'REJECTED', 'PARTIAL']),
          approvedAmount: claim.approvedAmount,
          requestAmount: claim.requestAmount
        }
      });
    }

    // Re-adjudication events (for RE_ADJUDICATED status)
    if (claim.editStatus === EditStatus.RE_ADJUDICATED) {
      const manager = randomFrom(managers);
      auditLog.push({
        id: generateId('AUD'),
        eventType: AuditEventType.CLAIM_RE_ADJUDICATED,
        claimId: claim.id,
        userId: claim.assignedTo,
        userName: claim.assignedToName,
        performedBy: manager.id,
        performedByName: manager.name,
        timestamp: claim.updatedAt,
        details: {
          lctSubmissionCount: claim.lctSubmissionCount,
          previousApprovedAmount: claim.approvedAmount - randomInt(1000, 5000),
          newApprovedAmount: claim.approvedAmount
        }
      });
    }

    // Detailed workflow events for in-progress and completed claims
    if (claim.editStatus === EditStatus.IN_PROGRESS ||
        claim.editStatus === EditStatus.ADJUDICATED ||
        claim.editStatus === EditStatus.RE_ADJUDICATED) {

      const baseTime = new Date(claim.createdAt).getTime();

      // Digitization started
      auditLog.push({
        id: generateId('AUD'),
        eventType: 'DIGITIZATION_STARTED',
        claimId: claim.id,
        userId: claim.assignedTo,
        userName: claim.assignedToName,
        performedBy: claim.assignedTo,
        performedByName: claim.assignedToName,
        timestamp: new Date(baseTime + 5 * 60 * 1000).toISOString(),
        details: { tab: 'digitisation', action: 'started' }
      });

      // Digitization completed
      auditLog.push({
        id: generateId('AUD'),
        eventType: 'DIGITIZATION_COMPLETED',
        claimId: claim.id,
        userId: claim.assignedTo,
        userName: claim.assignedToName,
        performedBy: claim.assignedTo,
        performedByName: claim.assignedToName,
        timestamp: new Date(baseTime + 15 * 60 * 1000).toISOString(),
        details: { tab: 'digitisation', action: 'completed', itemsProcessed: randomInt(5, 20) }
      });

      if (claim.editStatus === EditStatus.ADJUDICATED || claim.editStatus === EditStatus.RE_ADJUDICATED) {
        // Checklist started
        auditLog.push({
          id: generateId('AUD'),
          eventType: 'CHECKLIST_STARTED',
          claimId: claim.id,
          userId: claim.assignedTo,
          userName: claim.assignedToName,
          performedBy: claim.assignedTo,
          performedByName: claim.assignedToName,
          timestamp: new Date(baseTime + 16 * 60 * 1000).toISOString(),
          details: { tab: 'checklist', action: 'started' }
        });

        // Checklist completed
        auditLog.push({
          id: generateId('AUD'),
          eventType: 'CHECKLIST_COMPLETED',
          claimId: claim.id,
          userId: claim.assignedTo,
          userName: claim.assignedToName,
          performedBy: claim.assignedTo,
          performedByName: claim.assignedToName,
          timestamp: new Date(baseTime + 20 * 60 * 1000).toISOString(),
          details: { tab: 'checklist', action: 'completed', itemsValidated: randomInt(3, 6) }
        });

        // Clinical validation started
        auditLog.push({
          id: generateId('AUD'),
          eventType: 'CLINICAL_VALIDATION_STARTED',
          claimId: claim.id,
          userId: claim.assignedTo,
          userName: claim.assignedToName,
          performedBy: claim.assignedTo,
          performedByName: claim.assignedToName,
          timestamp: new Date(baseTime + 21 * 60 * 1000).toISOString(),
          details: { tab: 'clinical_validation', action: 'started' }
        });

        // Clinical validation completed
        auditLog.push({
          id: generateId('AUD'),
          eventType: 'CLINICAL_VALIDATION_COMPLETED',
          claimId: claim.id,
          userId: claim.assignedTo,
          userName: claim.assignedToName,
          performedBy: claim.assignedTo,
          performedByName: claim.assignedToName,
          timestamp: new Date(baseTime + 30 * 60 * 1000).toISOString(),
          details: { tab: 'clinical_validation', action: 'completed', modificationsCount: randomInt(0, 5) }
        });

        // Review started
        auditLog.push({
          id: generateId('AUD'),
          eventType: 'REVIEW_STARTED',
          claimId: claim.id,
          userId: claim.assignedTo,
          userName: claim.assignedToName,
          performedBy: claim.assignedTo,
          performedByName: claim.assignedToName,
          timestamp: new Date(baseTime + 31 * 60 * 1000).toISOString(),
          details: { tab: 'review', action: 'started' }
        });

        // Review completed & submitted
        auditLog.push({
          id: generateId('AUD'),
          eventType: 'REVIEW_COMPLETED',
          claimId: claim.id,
          userId: claim.assignedTo,
          userName: claim.assignedToName,
          performedBy: claim.assignedTo,
          performedByName: claim.assignedToName,
          timestamp: claim.updatedAt,
          details: {
            tab: 'review',
            action: 'completed_and_submitted',
            finalDecision: randomFrom(['APPROVED', 'REJECTED', 'PARTIAL']),
            totalAmount: claim.approvedAmount
          }
        });
      }
    }

    // Some reassignment events (10% of claims)
    if (Math.random() < 0.1 && claim.assignedTo) {
      const otherEditor = randomFrom(users.filter(u => u.role === UserRole.EDITOR && u.id !== claim.assignedTo));
      auditLog.push({
        id: generateId('AUD'),
        eventType: AuditEventType.CLAIM_REASSIGNED,
        claimId: claim.id,
        userId: claim.assignedTo,
        userName: claim.assignedToName,
        performedBy: randomFrom(managers).id,
        performedByName: randomFrom(managers).name,
        timestamp: randomDate(20),
        details: {
          previousAssignee: otherEditor.id,
          newAssignee: claim.assignedTo,
          reason: 'STANDARD'
        }
      });
    }
  });

  // Some user management events
  users.forEach(user => {
    auditLog.push({
      id: generateId('AUD'),
      eventType: AuditEventType.USER_CREATED,
      userId: user.id,
      userName: user.name,
      performedBy: users[0].id, // First manager created them
      performedByName: users[0].name,
      timestamp: user.createdAt,
      details: {
        email: user.email,
        role: user.role
      }
    });

    // Some deactivation/reactivation events
    if (user.status === UserStatus.INACTIVE) {
      auditLog.push({
        id: generateId('AUD'),
        eventType: AuditEventType.USER_DEACTIVATED,
        userId: user.id,
        userName: user.name,
        performedBy: users[0].id,
        performedByName: users[0].name,
        timestamp: randomDate(15),
        details: {
          claimsRedistributed: randomInt(0, 5)
        }
      });
    }
  });

  // Sort by timestamp (newest first)
  auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Initialize notifications
 */
const seedNotifications = () => {
  const activeEditors = users.filter(u => u.role === UserRole.EDITOR && u.status === UserStatus.ACTIVE);

  // Create recent notifications (last 7 days)
  activeEditors.slice(0, 5).forEach(editor => {
    const recentClaims = claims.filter(c => c.assignedTo === editor.id).slice(0, 2);

    recentClaims.forEach(claim => {
      notifications.push({
        id: generateId('NOT'),
        type: NotificationType.CLAIM_ASSIGNED,
        title: 'New Claim Assigned',
        message: `Claim ${claim.visitNumber} has been assigned to you`,
        read: Math.random() > 0.5,
        claimId: claim.id,
        userId: editor.id,
        createdAt: randomDate(7)
      });
    });

    // Some reassignment notifications
    if (Math.random() > 0.7) {
      notifications.push({
        id: generateId('NOT'),
        type: NotificationType.CLAIM_REASSIGNED,
        title: 'Claim Reassigned',
        message: `Claim has been reassigned to another editor`,
        read: Math.random() > 0.3,
        userId: editor.id,
        createdAt: randomDate(7)
      });
    }
  });

  // Sort by timestamp (newest first)
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Initialize all mock data
 */
export const initializeMockData = () => {
  // Clear existing data
  users.length = 0;
  claims.length = 0;
  assignments.length = 0;
  auditLog.length = 0;
  notifications.length = 0;

  // Seed data
  seedUsers();
  seedClaims();
  seedAuditLog();
  seedNotifications();

  console.log('[Mock Database] Initialized with:', {
    users: users.length,
    claims: claims.length,
    assignments: assignments.length,
    auditLog: auditLog.length,
    notifications: notifications.length
  });
};

// Initialize on module load
initializeMockData();

// ==================== HELPER FUNCTIONS ====================

/**
 * Get all claims
 */
export const getClaims = () => [...claims];

/**
 * Get claim by ID
 */
export const getClaimById = (id) => claims.find(c => c.id === id);

/**
 * Get claims by editor ID
 */
export const getClaimsByEditor = (editorId) => claims.filter(c => c.assignedTo === editorId);

/**
 * Get all users
 */
export const getUsers = () => [...users];

/**
 * Get user by ID
 */
export const getUserById = (id) => users.find(u => u.id === id);

/**
 * Get users by role
 */
export const getUsersByRole = (role) => users.filter(u => u.role === role);

/**
 * Get active editors
 */
export const getActiveEditors = () => users.filter(u => u.role === UserRole.EDITOR && u.status === UserStatus.ACTIVE);

/**
 * Get assignments
 */
export const getAssignments = () => [...assignments];

/**
 * Get audit log entries
 */
export const getAuditLog = (filters = {}) => {
  let filtered = [...auditLog];

  if (filters.eventTypes?.length) {
    filtered = filtered.filter(entry => filters.eventTypes.includes(entry.eventType));
  }

  if (filters.claimId) {
    filtered = filtered.filter(entry => entry.claimId === filters.claimId);
  }

  if (filters.userId) {
    filtered = filtered.filter(entry => entry.userId === filters.userId || entry.performedBy === filters.userId);
  }

  if (filters.startDate) {
    filtered = filtered.filter(entry => new Date(entry.timestamp) >= new Date(filters.startDate));
  }

  if (filters.endDate) {
    filtered = filtered.filter(entry => new Date(entry.timestamp) <= new Date(filters.endDate));
  }

  return filtered;
};

/**
 * Get notifications for user
 */
export const getNotifications = (userId) => notifications.filter(n => n.userId === userId);

// ==================== CRUD OPERATIONS ====================

/**
 * Create new user
 */
export const createUser = (userData) => {
  // Check email uniqueness
  const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error('Email already exists');
  }

  const newUser = {
    id: generateId(userData.role === UserRole.MANAGER ? 'MGR' : 'EDR'),
    email: userData.email,
    name: userData.name,
    role: userData.role,
    status: UserStatus.ACTIVE,
    claimsAssigned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);

  // Create audit log entry
  auditLog.unshift({
    id: generateId('AUD'),
    eventType: AuditEventType.USER_CREATED,
    userId: newUser.id,
    userName: newUser.name,
    performedBy: 'SYSTEM', // Will be replaced by actual manager ID
    performedByName: 'System',
    timestamp: new Date().toISOString(),
    details: {
      email: newUser.email,
      role: newUser.role
    }
  });

  return newUser;
};

/**
 * Update user status
 */
export const updateUserStatus = (userId, status) => {
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();

  return user;
};

/**
 * Reassign claim
 */
export const reassignClaim = (claimId, fromUserId, toUserId, type, performedBy) => {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) {
    throw new Error('Claim not found');
  }

  const toUser = users.find(u => u.id === toUserId);
  if (!toUser) {
    throw new Error('Target user not found');
  }

  // Update claim assignment
  claim.assignedTo = toUserId;
  claim.assignedToName = toUser.name;
  claim.updatedAt = new Date().toISOString();

  // Update assignment record
  const assignment = assignments.find(a => a.claimId === claimId);
  if (assignment) {
    assignment.userId = toUserId;
    assignment.assignedAt = new Date().toISOString();
    assignment.assignedBy = performedBy;
  } else {
    assignments.push({
      id: generateId('ASG'),
      claimId,
      userId: toUserId,
      assignedAt: new Date().toISOString(),
      assignedBy: performedBy
    });
  }

  // Update user claim counts
  users.forEach(user => {
    user.claimsAssigned = assignments.filter(a => a.userId === user.id).length;
  });

  return claim;
};

/**
 * Update claim status and LCT count
 */
export const updateClaim = (claimId, updates) => {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) {
    throw new Error('Claim not found');
  }

  Object.assign(claim, updates, {
    updatedAt: new Date().toISOString()
  });

  return claim;
};

/**
 * Add audit log entry
 */
export const addAuditEntry = (entry) => {
  const newEntry = {
    id: generateId('AUD'),
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString()
  };

  auditLog.unshift(newEntry); // Add to beginning (newest first)
  return newEntry;
};

/**
 * Add notification
 */
export const addNotification = (notification) => {
  const newNotification = {
    id: generateId('NOT'),
    ...notification,
    read: false,
    createdAt: new Date().toISOString()
  };

  notifications.unshift(newNotification); // Add to beginning (newest first)
  return newNotification;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = (notificationId) => {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
  return notification;
};

// Export everything
export default {
  // Data stores
  users,
  claims,
  assignments,
  auditLog,
  notifications,

  // Getters
  getClaims,
  getClaimById,
  getClaimsByEditor,
  getUsers,
  getUserById,
  getUsersByRole,
  getActiveEditors,
  getAssignments,
  getAuditLog,
  getNotifications,

  // CRUD
  createUser,
  updateUserStatus,
  reassignClaim,
  updateClaim,
  addAuditEntry,
  addNotification,
  markNotificationRead,

  // Utilities
  initializeMockData,
  generateId
};
