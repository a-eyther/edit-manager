/**
 * Status Badge Component
 * Displays status with appropriate color coding
 * @param {Object} props
 * @param {string} props.status - Status value
 */
const StatusBadge = ({ status }) => {
  if (!status) return null;

  const rawStatus = status.toString();
  const normalizedStatus = rawStatus.toUpperCase().replace(/\s+/g, '_');

  const STATUS_STYLES = {
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    DECISION_PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    APPROVED_MODIFIED: 'bg-blue-100 text-blue-700 border-blue-200',
    OPD: 'bg-blue-100 text-blue-700 border-blue-200',
    DENTAL: 'bg-purple-100 text-purple-700 border-purple-200',
    OPTICAL: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
    INPROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
    RESPONSE_SENT: 'bg-purple-100 text-purple-700 border-purple-200',
    TAT_EXPIRED: 'bg-red-100 text-red-700 border-red-200',
    ADJUDICATED: 'bg-green-100 text-green-700 border-green-200',
    AUTOMATED: 'bg-sky-100 text-sky-700 border-sky-200',
    EDITED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    UNASSIGNED: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  // Custom display text mapping for specific statuses
  const STATUS_DISPLAY_TEXT = {
    UNASSIGNED: 'Unassigned',
    PENDING: 'Pending',
    ADJUDICATED: 'Adjudication Done',
    IN_PROGRESS: 'In Progress',
    INPROGRESS: 'In Progress',
    RE_ADJUDICATED: 'Re-Adjudicated',
    AUTOMATED: 'Automated',
    EDITED: 'Edited',
  };

  const statusStyles = STATUS_STYLES[normalizedStatus] || STATUS_STYLES[rawStatus.toUpperCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  const displayText = STATUS_DISPLAY_TEXT[normalizedStatus] || rawStatus.replace(/_/g, ' ');

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border ${statusStyles}
      `}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
