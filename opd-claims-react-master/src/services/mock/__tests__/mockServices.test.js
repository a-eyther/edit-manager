/**
 * Mock Services Test Suite
 *
 * Validates all mock service functions work correctly and follow
 * business rules defined in PRD.
 *
 * Run with: npm test (if Jest configured)
 * Or manually import and call testAll() in browser console
 */

import {
  // Database
  initializeMockData,
  getClaims,
  getUsers,
  getActiveEditors,

  // Re-adjudication
  reAdjudicateClaim,
  canReAdjudicate,

  // Reassignment
  standardReassign,
  forceReassign,
  validateReassignment,

  // User Management
  createUser,
  activateUser,
  deactivateUser,
  resetPassword,
  getAllUsers,

  // Analytics
  getEditorAnalytics,
  getCapacityView,
  getAuditTrail
} from '../index';

import { UserRole, EditStatus, ReassignmentType } from '../../../types/api-contracts';

/**
 * Test runner
 */
export const testAll = async () => {
  console.log('🧪 Starting Mock Services Tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const test = (name, condition, message = '') => {
    const passed = condition;
    results.tests.push({ name, passed, message });
    if (passed) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      console.error(`❌ ${name}`, message);
      results.failed++;
    }
  };

  try {
    // ========== DATABASE TESTS ==========
    console.log('\n📊 Testing Database...');

    initializeMockData();
    const claims = getClaims();
    const users = getUsers();
    const editors = getActiveEditors();

    test('Database initializes with claims', claims.length >= 50);
    test('Database initializes with users', users.length >= 10);
    test('Active editors exist', editors.length >= 5);
    test('Claims have LCT counts 1-3', claims.every(c => c.lctSubmissionCount >= 1 && c.lctSubmissionCount <= 3));
    test('Claims have required fields', claims.every(c => c.id && c.visitNumber && c.patientName));

    // ========== RE-ADJUDICATION TESTS ==========
    console.log('\n🔄 Testing Re-Adjudication...');

    // Find an adjudicated claim with LCT < 3
    const adjudicatedClaim = claims.find(
      c => c.editStatus === EditStatus.ADJUDICATED && c.lctSubmissionCount < 3
    );

    if (adjudicatedClaim) {
      const targetEditor = editors[0];
      const reAdjResult = await reAdjudicateClaim({
        claimId: adjudicatedClaim.id,
        adjudicationData: { approvedAmount: 50000 },
        assignToEditorId: targetEditor.id,
        notes: 'Test re-adjudication'
      });

      test('Re-adjudication succeeds', reAdjResult.success);
      test('LCT count increments', reAdjResult.data?.lctSubmissionCount === adjudicatedClaim.lctSubmissionCount + 1);
      test('Claim assigned to editor', reAdjResult.data?.claim.assignedTo === targetEditor.id);
      test('Notification sent', reAdjResult.data?.notificationSent === true);
    }

    // Test LCT max validation
    const maxLctClaim = claims.find(c => c.lctSubmissionCount === 3);
    if (maxLctClaim) {
      const maxLctResult = await canReAdjudicate(maxLctClaim.id);
      test('Cannot re-adjudicate claim with LCT=3', !maxLctResult.canReAdjudicate);
      test('Max LCT reason correct', maxLctResult.reason === 'MAX_LCT_REACHED');
    }

    // ========== REASSIGNMENT TESTS ==========
    console.log('\n↔️  Testing Reassignment...');

    // Find a pending claim
    const pendingClaim = claims.find(c => c.editStatus === EditStatus.PENDING && c.assignedTo);
    if (pendingClaim && editors.length >= 2) {
      const targetEditor = editors.find(e => e.id !== pendingClaim.assignedTo);

      // Standard reassignment
      const standardResult = await standardReassign({
        claimId: pendingClaim.id,
        fromEditorId: pendingClaim.assignedTo,
        toEditorId: targetEditor.id,
        type: ReassignmentType.STANDARD
      });

      test('Standard reassignment succeeds', standardResult.success);
      test('Claim reassigned to new editor', standardResult.data?.claim.assignedTo === targetEditor.id);
      test('Reassignment type is standard', standardResult.data?.type === ReassignmentType.STANDARD);
      test('Not forced', standardResult.data?.wasForced === false);
    }

    // Find an in-progress claim
    const inProgressClaim = claims.find(c => c.editStatus === EditStatus.IN_PROGRESS && c.assignedTo);
    if (inProgressClaim && editors.length >= 2) {
      const targetEditor = editors.find(e => e.id !== inProgressClaim.assignedTo);

      // Force reassignment
      const forceResult = await forceReassign({
        claimId: inProgressClaim.id,
        fromEditorId: inProgressClaim.assignedTo,
        toEditorId: targetEditor.id,
        type: ReassignmentType.FORCE
      });

      test('Force reassignment succeeds', forceResult.success);
      test('Force reassignment marked as forced', forceResult.data?.wasForced === true);
    }

    // Test validation
    const validationResult = await validateReassignment(pendingClaim?.id, ReassignmentType.STANDARD);
    test('Validation returns result', validationResult.success !== undefined);

    // ========== USER MANAGEMENT TESTS ==========
    console.log('\n👥 Testing User Management...');

    // Create user
    const createResult = await createUser({
      email: 'test.editor@test.com',
      name: 'Test Editor',
      role: UserRole.EDITOR
    });

    test('User creation succeeds', createResult.success);
    test('Temporary password generated', createResult.data?.temporaryPassword?.length > 0);
    test('User has correct role', createResult.data?.user.role === UserRole.EDITOR);
    test('User is active', createResult.data?.user.status === 'ACTIVE');

    // Test duplicate email
    const duplicateResult = await createUser({
      email: 'test.editor@test.com',
      name: 'Duplicate User',
      role: UserRole.EDITOR
    });

    test('Duplicate email rejected', !duplicateResult.success);
    test('Duplicate error code correct', duplicateResult.error === 'EMAIL_EXISTS');

    // Get all users
    const allUsersResult = await getAllUsers({ page: 1, limit: 25 });
    test('Get all users succeeds', allUsersResult.success);
    test('Pagination data present', allUsersResult.data?.pagination?.total > 0);

    // Deactivate user (use an existing active editor)
    const activeEditor = editors[0];
    if (activeEditor) {
      const deactivateResult = await deactivateUser({ userId: activeEditor.id });
      test('User deactivation succeeds', deactivateResult.success);
      test('Deactivated user is inactive', deactivateResult.data?.user.status === 'INACTIVE');
      test('Claims redistributed', deactivateResult.data?.claimsRedistributed >= 0);
    }

    // Activate user
    const inactiveUser = users.find(u => u.status === 'INACTIVE');
    if (inactiveUser) {
      const activateResult = await activateUser({ userId: inactiveUser.id });
      test('User activation succeeds', activateResult.success);
      test('Activated user is active', activateResult.data?.user.status === 'ACTIVE');
    }

    // Reset password
    const resetResult = await resetPassword({ userId: editors[1]?.id });
    test('Password reset succeeds', resetResult.success);
    test('Reset token generated', resetResult.data?.resetToken?.length > 0);
    test('Email sent flag set', resetResult.data?.emailSent === true);

    // ========== ANALYTICS TESTS ==========
    console.log('\n📈 Testing Analytics...');

    const editorForAnalytics = editors[0];
    if (editorForAnalytics) {
      const analyticsResult = await getEditorAnalytics({
        editorId: editorForAnalytics.id,
        startDate: '2025-10-01',
        endDate: '2025-10-31'
      });

      test('Analytics fetch succeeds', analyticsResult.success);
      test('Key metrics present', analyticsResult.data?.keyMetrics !== undefined);
      test('Outcomes present', analyticsResult.data?.outcomes !== undefined);
      test('Quality indicators present', analyticsResult.data?.qualityIndicators !== undefined);
      test('Trends present', analyticsResult.data?.trends !== undefined);
      test('Productivity score calculated',
        analyticsResult.data?.productivityScore >= 0 && analyticsResult.data?.productivityScore <= 100
      );
      test('Daily adjudications array exists', Array.isArray(analyticsResult.data?.trends?.dailyAdjudications));
    }

    // Capacity view
    const capacityResult = await getCapacityView();
    test('Capacity view succeeds', capacityResult.success);
    test('Editors list present', Array.isArray(capacityResult.data?.editors));
    test('Total claims calculated', capacityResult.data?.totalClaims >= 0);
    test('Average queue size calculated', capacityResult.data?.averageQueueSize >= 0);

    // Audit trail
    const auditResult = await getAuditTrail({ page: 1, limit: 50 });
    test('Audit trail fetch succeeds', auditResult.success);
    test('Audit entries returned', Array.isArray(auditResult.data?.data));
    test('Pagination present', auditResult.data?.pagination !== undefined);

    // ========== BUSINESS RULES VALIDATION ==========
    console.log('\n⚖️  Testing Business Rules...');

    // Rule: LCT count max 3
    const allClaimsLctValid = claims.every(c => c.lctSubmissionCount <= 3);
    test('BR: LCT count never exceeds 3', allClaimsLctValid);

    // Rule: Active users have ACTIVE status
    const activeUsersValid = editors.every(e => e.status === 'ACTIVE');
    test('BR: Active editors have ACTIVE status', activeUsersValid);

    // Rule: Claim assignments point to valid users
    const assignedClaims = claims.filter(c => c.assignedTo);
    const assignmentsValid = assignedClaims.every(c => {
      const assignee = users.find(u => u.id === c.assignedTo);
      return assignee !== undefined;
    });
    test('BR: All claim assignments point to valid users', assignmentsValid);

  } catch (error) {
    console.error('💥 Test suite error:', error);
    results.failed++;
  }

  // ========== RESULTS SUMMARY ==========
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.passed + results.failed}`);
  console.log(`🎯 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  console.log('='.repeat(50) + '\n');

  return results;
};

// Auto-run if in test environment
if (typeof window !== 'undefined' && window.location?.search?.includes('test=true')) {
  testAll().then(results => {
    console.log('✨ Tests completed. Check results above.');
  });
}

export default testAll;
