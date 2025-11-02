import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { setSelectedClaim } from '../../../store/slices/claimsSlice';

/**
 * Re-Edit Button Component
 *
 * Navigates to claim detail page for re-editing completed/adjudicated claims.
 * Only visible for claims with edit_status === 'ADJUDICATED', 'RE_ADJUDICATED', or 'COMPLETED'
 * Disabled when LCT submission count reaches 3.
 *
 * @param {Object} props
 * @param {Object} props.row - Full claim row data
 * @param {number} props.lctSubmissionCount - Current LCT submission count (1-3)
 * @param {string} props.editStatus - Current edit status of the claim
 * @returns {JSX.Element|null}
 */
const ReEditButton = ({ row, lctSubmissionCount = 0, editStatus }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  // Only show button for completed/adjudicated claims
  // Show for: ADJUDICATED, RE_ADJUDICATED, COMPLETED (all indicate finished workflow)
  const allowedStatuses = ['ADJUDICATED', 'RE_ADJUDICATED', 'COMPLETED'];
  if (!editStatus || !allowedStatuses.includes(editStatus.toUpperCase())) {
    return null;
  }

  const isMaxReached = lctSubmissionCount >= 3;
  const isDisabled = isMaxReached;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDisabled) return;

    // Store claim data in Redux before navigation
    dispatch(setSelectedClaim(row));

    // Navigate to claim page for re-editing
    navigate(`/claim/${row.claim_unique_id}`);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        onMouseEnter={() => isDisabled && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
          transition-all duration-200
          ${isDisabled
            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            : 'bg-white text-primary-600 border border-primary-500 hover:bg-primary-50 active:bg-primary-100'
          }
        `}
        aria-label={`Re-edit claim ${row.claim_unique_id}`}
        aria-disabled={isDisabled}
      >
        <RefreshCw className="w-4 h-4" />
        <span>Re-Edit</span>
        {lctSubmissionCount > 0 && (
          <span className={`
            ml-1 px-1.5 py-0.5 rounded-full text-2xs font-semibold
            ${isMaxReached
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
            }
          `}>
            {lctSubmissionCount}/3
          </span>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && isMaxReached && (
        <div
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2
                     bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap
                     animate-fade-in"
          role="tooltip"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Maximum re-edits (3) reached for this claim</span>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReEditButton;
