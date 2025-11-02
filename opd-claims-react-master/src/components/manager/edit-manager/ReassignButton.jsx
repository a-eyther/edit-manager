import { UserCog, AlertTriangle } from 'lucide-react';
import { EditStatus } from '../../../types/api-contracts';

/**
 * Reassign Button Component
 *
 * Displays reassignment button based on claim's edit status.
 * Determines if standard or force reassignment is needed.
 *
 * @param {Object} props
 * @param {Object} props.claim - Claim object with editStatus
 * @param {Function} props.onReassign - Callback when reassign is triggered (claim, type)
 * @returns {JSX.Element}
 */
const ReassignButton = ({ claim, onReassign }) => {
  if (!claim) return null;

  // Determine reassignment type based on edit status
  const isInProgress = claim.editStatus === EditStatus.IN_PROGRESS;
  const reassignmentType = isInProgress ? 'FORCE' : 'STANDARD';

  const handleClick = () => {
    if (onReassign) {
      onReassign(claim, reassignmentType);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200
        ${isInProgress
          ? 'bg-orange-50 text-orange-700 border border-orange-300 hover:bg-orange-100'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
      `}
      aria-label={`Reassign claim ${claim.id}`}
      title={isInProgress ? 'Force reassignment required (claim in progress)' : 'Reassign claim'}
    >
      {isInProgress ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <UserCog className="w-4 h-4" />
      )}
      <span>Reassign</span>
      {isInProgress && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full text-2xs font-semibold bg-orange-200 text-orange-800">
          FORCE
        </span>
      )}
    </button>
  );
};

export default ReassignButton;
