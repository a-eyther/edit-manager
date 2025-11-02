/**
 * Determine the workflow stage for a claim based on its status flags.
 * Accepts either the list view row object or the detailed claim status block.
 */
export const getWorkflowStage = (claim) => {
  if (!claim) return 'PENDING';

  const getField = (...keys) => {
    for (const key of keys) {
      if (claim[key] !== undefined && claim[key] !== null) {
        return claim[key];
      }
    }
    if (claim.claim_status) {
      for (const key of keys) {
        if (claim.claim_status[key] !== undefined && claim.claim_status[key] !== null) {
          return claim.claim_status[key];
        }
      }
    }
    return undefined;
  };

  const assignmentInfo =
    claim.assignment_status ||
    claim.assignmentStatus ||
    claim.assignment ||
    claim.claim_status?.assignment ||
    null;

  const editStatusRaw = getField('edit_status', 'status');
  const editStatusNormalized = (editStatusRaw || '')
    .toString()
    .toUpperCase()
    .replace(/\s+/g, '_');
  const isAssigned = Boolean(assignmentInfo?.is_assigned);

  const isLocked = Boolean(getField('is_locked', 'locked'));
  if (isLocked) {
    return 'RESPONSE SENT';
  }

  const tatDeadline = getField('tat_deadline');
  if (tatDeadline) {
    const now = new Date();
    const tatDate = new Date(tatDeadline);
    if (now > tatDate) {
      return 'TAT_EXPIRED';
    }
  }

  const finalDecision = (getField('final_decision', 'finalDecision') || '').toString().toUpperCase();
  const hasFinalDecision = ['APPROVED', 'REJECTED', 'QUERY'].includes(finalDecision);
  const manualCompletionStatuses = new Set([
    'EDITED',
    'REVIEWED',
    'MANUAL_REVIEWED',
    'MANUAL_REVIEW',
    'FINALIZED',
    'CLOSED',
    'SUBMITTED',
  ]);

  if (hasFinalDecision && (isLocked || manualCompletionStatuses.has(editStatusNormalized))) {
    return 'ADJUDICATED';
  }

  if (!isAssigned) {
    if (editStatusNormalized) {
      return editStatusNormalized.replace(/_/g, ' ');
    }
    return 'PENDING';
  }

  if (editStatusNormalized === 'EDITED') {
    return 'IN_PROGRESS';
  }

  if (editStatusNormalized) {
    return editStatusNormalized.replace(/_/g, ' ');
  }

  return 'IN_PROGRESS';
};

export default getWorkflowStage;
