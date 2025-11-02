/**
 * Analytics Mock Service (F4)
 *
 * Generates performance analytics and metrics for editors.
 * Calculates key metrics, outcomes, quality indicators, and trends.
 */

import {
  EditStatus,
  AuditEventType
} from '../../types/api-contracts';

import {
  getUserById,
  getClaims,
  getAuditLog
} from './mockDatabase';

/**
 * Simulate API delay
 */
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Filter claims by date range
 */
const filterByDateRange = (items, startDate, endDate, dateField = 'createdAt') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include entire end date

  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= start && itemDate <= end;
  });
};

/**
 * Check if a date is today
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear();
};

/**
 * Generate daily time series data
 */
const generateDailyTimeSeries = (startDate, endDate, dataMap) => {
  const result = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    result.push({
      date: dateStr,
      value: dataMap[dateStr] || 0
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

/**
 * Calculate average processing time
 */
const calculateAvgProcessingTime = (claims) => {
  if (claims.length === 0) return 0;

  const totalTime = claims.reduce((sum, claim) => {
    // Simulate processing time based on claim complexity
    const baseTime = 45; // minutes
    const variance = Math.random() * 30; // 0-30 minutes variance
    return sum + baseTime + variance;
  }, 0);

  return Math.round(totalTime / claims.length);
};

/**
 * Calculate productivity score (0-100)
 */
const calculateProductivityScore = (metrics, outcomes, quality) => {
  // Factors:
  // 1. Adjudication rate (40%): claims adjudicated / claims assigned
  // 2. Approval rate (30%): approved / total adjudications
  // 3. Quality (30%): 100 - (re-edits % + rejection rate %)

  const adjudicationRate = metrics.claimsAssigned > 0
    ? (metrics.claimsAdjudicated / metrics.claimsAssigned) * 100
    : 0;

  const totalAdjudications = outcomes.approved + outcomes.rejected + outcomes.partiallyApproved;
  const approvalRate = totalAdjudications > 0
    ? (outcomes.approved / totalAdjudications) * 100
    : 0;

  const reEditPercentage = metrics.claimsAdjudicated > 0
    ? (quality.managerReEdits / metrics.claimsAdjudicated) * 100
    : 0;

  const totalVetting = quality.vettingApproved + quality.vettingRejected + quality.vettingPartial;
  const rejectionRate = totalVetting > 0
    ? (quality.vettingRejected / totalVetting) * 100
    : 0;

  const qualityScore = Math.max(0, 100 - reEditPercentage - rejectionRate);

  const productivityScore = (adjudicationRate * 0.4) + (approvalRate * 0.3) + (qualityScore * 0.3);

  return Math.round(Math.min(100, productivityScore));
};

/**
 * Get editor analytics (F4)
 *
 * Calculates comprehensive performance metrics for individual editor
 *
 * @param {object} request - EditorAnalyticsRequest
 * @returns {Promise<object>} EditorAnalyticsResponse
 */
export const getEditorAnalytics = async (request) => {
  await simulateDelay(400);

  try {
    const { editorId, startDate, endDate } = request;

    // Validate editor exists
    const editor = getUserById(editorId);
    if (!editor) {
      return {
        success: false,
        error: 'EDITOR_NOT_FOUND',
        message: 'Editor not found',
        timestamp: new Date().toISOString()
      };
    }

    // Get all claims
    const allClaims = getClaims();

    // Filter claims assigned to this editor in date range
    const assignedClaims = allClaims.filter(c => c.assignedTo === editorId);
    const assignedInRange = filterByDateRange(assignedClaims, startDate, endDate, 'createdAt');

    // Filter adjudicated claims in date range
    const adjudicatedClaims = allClaims.filter(
      c => c.assignedTo === editorId &&
      (c.editStatus === EditStatus.ADJUDICATED || c.editStatus === EditStatus.RE_ADJUDICATED)
    );
    const adjudicatedInRange = filterByDateRange(adjudicatedClaims, startDate, endDate, 'updatedAt');

    // Current pending and queried (real-time, not date-filtered)
    const currentPending = assignedClaims.filter(c => c.editStatus === EditStatus.PENDING).length;
    const currentQueried = 0; // Placeholder - would come from query status field

    // --- KEY METRICS ---
    const keyMetrics = {
      claimsAssigned: assignedInRange.length,
      claimsAdjudicated: adjudicatedInRange.length,
      claimsPending: currentPending,
      claimsQueried: currentQueried
    };

    // --- OUTCOMES ---
    // Simulate outcome distribution (approved/rejected/partial)
    const outcomes = {
      approved: 0,
      rejected: 0,
      partiallyApproved: 0
    };

    // Ensure minimum realistic values
    const adjudicatedCount = adjudicatedInRange.length;
    if (adjudicatedCount > 0) {
      adjudicatedInRange.forEach(claim => {
        // Realistic distribution: 60% approved, 25% partial, 15% rejected
        const rand = Math.random();
        if (rand < 0.6) outcomes.approved++;
        else if (rand < 0.85) outcomes.partiallyApproved++;
        else outcomes.rejected++;
      });
    } else {
      // Provide realistic defaults when no claims in range
      outcomes.approved = Math.max(10, Math.round(keyMetrics.claimsAdjudicated * 0.6));
      outcomes.partiallyApproved = Math.max(3, Math.round(keyMetrics.claimsAdjudicated * 0.25));
      outcomes.rejected = Math.max(2, Math.round(keyMetrics.claimsAdjudicated * 0.15));
    }

    // --- QUALITY INDICATORS ---
    // Get audit log for re-edits
    const auditLog = getAuditLog({
      userId: editorId,
      startDate,
      endDate,
      eventTypes: [AuditEventType.CLAIM_RE_ADJUDICATED, AuditEventType.CLAIM_REASSIGNED]
    });

    const reEditEvents = auditLog.filter(e => e.eventType === AuditEventType.CLAIM_RE_ADJUDICATED);
    const reassignEvents = auditLog.filter(e => e.eventType === AuditEventType.CLAIM_REASSIGNED);

    // Simulate vetting results (would come from LCT integration in real system)
    const totalAdjudicated = adjudicatedInRange.length;
    const vettingApproved = Math.max(8, Math.round(totalAdjudicated * 0.65)); // 65% approval rate
    const vettingRejected = Math.max(2, Math.round(totalAdjudicated * 0.20)); // 20% rejection rate
    const vettingPartial = Math.max(1, Math.round(totalAdjudicated * 0.10)); // 10% partial
    const vettingPending = totalAdjudicated - vettingApproved - vettingRejected - vettingPartial; // Rest pending

    const qualityIndicators = {
      managerReEdits: Math.max(1, reEditEvents.length),
      vettingApproved,
      vettingRejected,
      vettingPartial: vettingPartial,
      reassignmentCount: Math.max(0, reassignEvents.length)
    };

    // --- PERFORMANCE TRENDS ---
    // Generate daily adjudication counts
    const dailyAdjudicationMap = {};
    adjudicatedInRange.forEach(claim => {
      const date = new Date(claim.updatedAt).toISOString().split('T')[0];
      dailyAdjudicationMap[date] = (dailyAdjudicationMap[date] || 0) + 1;
    });

    const dailyAdjudications = generateDailyTimeSeries(startDate, endDate, dailyAdjudicationMap);

    // Generate approval rate trend
    const approvalRateMap = {};
    const dailyApprovals = {};
    const dailyTotals = {};

    adjudicatedInRange.forEach(claim => {
      const date = new Date(claim.updatedAt).toISOString().split('T')[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + 1;

      // Use outcomes distribution
      const rand = Math.random();
      if (rand < 0.6) { // 60% approved
        dailyApprovals[date] = (dailyApprovals[date] || 0) + 1;
      }
    });

    // Calculate daily approval rates
    Object.keys(dailyTotals).forEach(date => {
      const approvals = dailyApprovals[date] || 0;
      const total = dailyTotals[date] || 1;
      approvalRateMap[date] = Math.round((approvals / total) * 100);
    });

    const approvalRate = generateDailyTimeSeries(startDate, endDate, approvalRateMap);

    // Generate avg processing time trend (simulated with realistic variance)
    const avgProcessingTimeMap = {};
    Object.keys(dailyAdjudicationMap).forEach(date => {
      avgProcessingTimeMap[date] = Math.round(40 + Math.random() * 20); // 40-60 minutes
    });

    const avgProcessingTime = generateDailyTimeSeries(startDate, endDate, avgProcessingTimeMap);

    const trends = {
      dailyAdjudications,
      approvalRate,
      avgProcessingTime
    };

    // --- RECENT CLAIMS ---
    // Get all assigned claims for this editor (including active ones)
    const allAssignedClaims = assignedClaims.slice().sort((a, b) =>
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

    const recentClaims = allAssignedClaims.slice(0, 20).map(claim => {
      // Determine outcome based on status
      let outcome = null;
      if (['ADJUDICATED', 'RE_ADJUDICATED', 'COMPLETED'].includes(claim.editStatus)) {
        const rand = Math.random();
        if (rand < 0.6) outcome = 'APPROVED';
        else if (rand < 0.85) outcome = 'PARTIAL';
        else outcome = 'REJECTED';
      }

      return {
        id: claim.id,
        visitNumber: claim.visitNumber,
        patientName: claim.patientName,
        editStatus: claim.editStatus,
        outcome,
        adjudicatedAt: ['ADJUDICATED', 'RE_ADJUDICATED', 'COMPLETED'].includes(claim.editStatus)
          ? claim.updatedAt
          : null
      };
    });

    // --- OVERALL METRICS ---
    const averageProcessingTime = calculateAvgProcessingTime(adjudicatedInRange);
    const productivityScore = calculateProductivityScore(keyMetrics, outcomes, qualityIndicators);

    // Return successful response
    return {
      success: true,
      data: {
        editor: {
          id: editor.id,
          name: editor.name,
          email: editor.email
        },
        dateRange: {
          start: startDate,
          end: endDate
        },
        keyMetrics,
        outcomes,
        qualityIndicators,
        trends,
        recentClaims,
        averageProcessingTime,
        productivityScore
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Get editor analytics error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'An error occurred while fetching analytics',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get team-wide analytics summary
 *
 * @param {object} request - Date range
 * @returns {Promise<object>} Team analytics
 */
export const getTeamAnalytics = async (request) => {
  await simulateDelay(500);

  try {
    const { startDate, endDate } = request;

    const allClaims = getClaims();
    const claimsInRange = filterByDateRange(allClaims, startDate, endDate, 'updatedAt');

    // Aggregate metrics across all editors
    const totalAssigned = claimsInRange.length;
    const totalAdjudicated = claimsInRange.filter(
      c => c.editStatus === EditStatus.ADJUDICATED || c.editStatus === EditStatus.RE_ADJUDICATED
    ).length;

    const totalPending = allClaims.filter(c => c.editStatus === EditStatus.PENDING).length;

    // Simulate outcomes
    const approved = Math.round(totalAdjudicated * 0.6);
    const rejected = Math.round(totalAdjudicated * 0.15);
    const partial = totalAdjudicated - approved - rejected;

    // Audit events in range
    const auditLog = getAuditLog({ startDate, endDate });
    const reEdits = auditLog.filter(e => e.eventType === AuditEventType.CLAIM_RE_ADJUDICATED).length;
    const reassignments = auditLog.filter(e => e.eventType === AuditEventType.CLAIM_REASSIGNED).length;

    return {
      success: true,
      data: {
        dateRange: { start: startDate, end: endDate },
        summary: {
          totalAssigned,
          totalAdjudicated,
          totalPending,
          approved,
          rejected,
          partial,
          reEdits,
          reassignments,
          avgProcessingTime: calculateAvgProcessingTime(claimsInRange),
          approvalRate: totalAdjudicated > 0 ? Math.round((approved / totalAdjudicated) * 100) : 0
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Get team analytics error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get capacity view (real-time editor workload)
 *
 * @returns {Promise<object>} CapacityViewResponse
 */
export const getCapacityView = async () => {
  await simulateDelay(200);

  try {
    const { getActiveEditors } = await import('./mockDatabase');
    const activeEditors = getActiveEditors();
    const allClaims = getClaims();

    const editors = activeEditors.map(editor => {
      const assignedClaims = allClaims.filter(c => c.assignedTo === editor.id);
      const inProgressClaims = assignedClaims.filter(c => c.editStatus === EditStatus.IN_PROGRESS).length;
      const pendingClaims = assignedClaims.filter(c => c.editStatus === EditStatus.PENDING).length;

      // Calculate claims adjudicated today (ADJUDICATED, RE_ADJUDICATED, COMPLETED)
      const adjudicatedToday = assignedClaims.filter(c =>
        ['ADJUDICATED', 'RE_ADJUDICATED', 'COMPLETED'].includes(c.editStatus) &&
        c.updatedAt && isToday(c.updatedAt)
      ).length;

      // Capacity: assume max 20 claims per editor
      const maxCapacity = 20;
      const capacityPercentage = Math.round((assignedClaims.length / maxCapacity) * 100);

      return {
        id: editor.id,
        name: editor.name,
        role: editor.role,
        status: editor.status,
        claimsAssigned: assignedClaims.length,
        claimsInProgress: inProgressClaims,
        claimsPending: pendingClaims,
        claimsAdjudicatedToday: adjudicatedToday,
        capacityPercentage: Math.min(100, capacityPercentage),
        lastActivity: editor.lastLogin
      };
    });

    const totalEditors = editors.length;
    const activeEditorsCount = editors.filter(e => e.status === 'ACTIVE').length;
    const totalClaims = allClaims.filter(c => c.assignedTo).length;
    const averageQueueSize = activeEditorsCount > 0
      ? Math.round(totalClaims / activeEditorsCount)
      : 0;

    return {
      success: true,
      data: {
        totalEditors,
        activeEditors: activeEditorsCount,
        totalClaims,
        averageQueueSize,
        editors,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Get capacity view error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Export editor analytics report
 *
 * @param {string} editorId
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Promise<object>} Export result
 */
export const exportEditorReport = async (editorId, startDate, endDate) => {
  await simulateDelay(600);

  try {
    // Get full analytics
    const analyticsResponse = await getEditorAnalytics({ editorId, startDate, endDate });

    if (!analyticsResponse.success) {
      return analyticsResponse;
    }

    const analytics = analyticsResponse.data;

    // Generate PDF filename
    const fileName = `Editor_Performance_${analytics.editor.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.pdf`;

    // In real implementation, this would generate actual PDF
    // For mock, we'll return a simulated download link

    return {
      success: true,
      data: {
        fileName,
        downloadUrl: `/mock/downloads/${fileName}`,
        format: 'PDF',
        generatedAt: new Date().toISOString(),
        fileSize: '2.4 MB' // Simulated
      },
      message: 'Report generated successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Export report error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get audit trail with pagination
 *
 * @param {object} request - AuditLogRequest
 * @returns {Promise<object>} Paginated audit log
 */
export const getAuditTrail = async (request) => {
  await simulateDelay(300);

  try {
    const { eventTypes, claimId, userId, startDate, endDate, search, page = 1, limit = 50 } = request;

    // Get filtered audit log
    let entries = getAuditLog({
      eventTypes,
      claimId,
      userId,
      startDate,
      endDate
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      entries = entries.filter(entry =>
        entry.userName?.toLowerCase().includes(searchLower) ||
        entry.performedByName?.toLowerCase().includes(searchLower) ||
        entry.claimId?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = entries.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = entries.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedEntries,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Mock] Get audit trail error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  getEditorAnalytics,
  getTeamAnalytics,
  getCapacityView,
  exportEditorReport,
  getAuditTrail
};
