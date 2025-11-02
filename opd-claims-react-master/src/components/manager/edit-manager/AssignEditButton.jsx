import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { setSelectedClaim } from '../../../store/slices/claimsSlice';

/**
 * Assign & Edit Button Component
 *
 * Navigates to claim detail page for editing pending claims.
 * Claim will be auto-assigned to editor when opened.
 * Only visible for claims with edit_status === 'PENDING' or 'IN_PROGRESS' (not yet adjudicated).
 *
 * @param {Object} props
 * @param {Object} props.row - Full claim row data
 * @param {string} props.editStatus - Current edit status of the claim
 * @returns {JSX.Element|null}
 */
const AssignEditButton = ({ row, editStatus }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Only show button for pending claims (not yet adjudicated)
  const allowedStatuses = ['PENDING', 'IN_PROGRESS'];
  if (!editStatus || !allowedStatuses.includes(editStatus.toUpperCase())) {
    return null;
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Store claim data in Redux before navigation
    dispatch(setSelectedClaim(row));

    // Navigate to claim page for editing (claim will auto-assign on open)
    navigate(`/claim/${row.claim_unique_id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                 bg-white text-primary-600 border border-primary-500 hover:bg-primary-50
                 active:bg-primary-100 transition-all duration-200"
      aria-label={`Assign and edit claim ${row.claim_unique_id}`}
    >
      <UserPlus className="w-4 h-4" />
      <span>Assign & Edit</span>
    </button>
  );
};

export default AssignEditButton;
