import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, UserPlus, RefreshCw, Eye, Edit3, FileText, AlertTriangle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedClaim } from '../../store/slices/claimsSlice';
import { openReassignmentModal } from '../../store/slices/reassignmentSlice';
import ClaimAuditModal from './ClaimAuditModal';
import AssignToModal from './AssignToModal';

/**
 * Unified Action Menu for Claims
 * Displays status-based dropdown menu with conditional actions
 *
 * @param {Object} props
 * @param {Object} props.row - Claim row data
 * @returns {JSX.Element}
 */
const ClaimActionMenu = ({ row }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuItemRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const menuState = getMenuState(row);
    const actionItems = menuState.actions.filter(action => !action.isDivider);

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev < actionItems.length - 1 ? prev + 1 : 0;
            menuItemRefs.current[nextIndex]?.focus();
            return nextIndex;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev > 0 ? prev - 1 : actionItems.length - 1;
            menuItemRefs.current[nextIndex]?.focus();
            return nextIndex;
          });
          break;

        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          menuItemRefs.current[0]?.focus();
          break;

        case 'End':
          e.preventDefault();
          const lastIndex = actionItems.length - 1;
          setFocusedIndex(lastIndex);
          menuItemRefs.current[lastIndex]?.focus();
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, row]);

  // Focus first menu item when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
      // Small delay to ensure portal is rendered
      setTimeout(() => {
        menuItemRefs.current[0]?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Calculate dropdown position
  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 300; // approximate
      const menuWidth = 224; // 14rem = 224px

      let top = rect.bottom + window.scrollY + 4;
      let left = rect.left + window.scrollX;

      // Flip vertical if near bottom of viewport
      if (rect.bottom + menuHeight > window.innerHeight) {
        top = rect.top + window.scrollY - menuHeight;
      }

      // Flip horizontal if near right edge
      if (rect.left + menuWidth > window.innerWidth) {
        left = rect.right + window.scrollX - menuWidth;
      }

      setPosition({ top, left });
    }
    setIsOpen(!isOpen);
  };

  // Determine menu state based on claim status
  const menuState = getMenuState(row);

  // Action handlers
  const handleSelfAssignEdit = () => {
    // Opens claim in edit mode and auto-assigns to current user
    dispatch(setSelectedClaim(row));
    navigate(`/claim/${row.claim_unique_id}`, { state: { mode: 'edit', autoAssign: true } });
    setIsOpen(false);
  };

  const handleAssignTo = () => {
    // Opens modal to assign claim to a specific editor
    setIsOpen(false);
    setIsAssignModalOpen(true);
  };

  const handleReassignTo = () => {
    // Opens reassignment modal for already-assigned claim
    dispatch(openReassignmentModal({
      claim: row,
      type: 'STANDARD'
    }));
    setIsOpen(false);
  };

  const handleForceReassign = () => {
    // Opens reassignment modal with force flag
    dispatch(openReassignmentModal({
      claim: row,
      type: 'FORCE'
    }));
    setIsOpen(false);
  };

  const handleView = () => {
    // Opens claim in view-only mode (no edit controls)
    dispatch(setSelectedClaim(row));
    navigate(`/claim/${row.claim_unique_id}`, { state: { mode: 'view' } });
    setIsOpen(false);
  };

  const handleReEdit = () => {
    // Opens claim for re-editing (checks LCT count)
    const lctCount = row.lct_submission_count || 0;
    if (lctCount >= 3) {
      alert('Maximum re-edits (3) reached for this claim');
      setIsOpen(false);
      return;
    }
    dispatch(setSelectedClaim(row));
    navigate(`/claim/${row.claim_unique_id}`, { state: { mode: 'edit', isReEdit: true } });
    setIsOpen(false);
  };

  const handleAudit = () => {
    setIsOpen(false);
    setIsAuditModalOpen(true);
  };

  // Map action IDs to handlers
  const actionHandlers = {
    'self-assign-edit': handleSelfAssignEdit,
    'assign-to': handleAssignTo,
    'reassign-to': handleReassignTo,
    'force-reassign': handleForceReassign,
    'view': handleView,
    're-edit': handleReEdit,
    'audit': handleAudit,
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="inline-flex items-center justify-center p-1.5 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {/* Dropdown Portal */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          className="fixed z-50 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="action-menu"
        >
          {(() => {
            let actionIndex = 0;
            return menuState.actions.map((action, index) => {
              if (action.isDivider) {
                return <div key={`divider-${index}`} className="h-px bg-gray-200 my-1" />;
              }

              const handler = actionHandlers[action.id];
              const isDisabled = action.disabled || !handler;
              const currentActionIndex = actionIndex;
              actionIndex++;

              return (
                <button
                  key={action.id}
                  ref={(el) => (menuItemRefs.current[currentActionIndex] = el)}
                  onClick={() => handler && handler()}
                  disabled={isDisabled}
                  className={`
                    w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors
                    ${isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:bg-gray-100 focus:outline-none'
                    }
                  `}
                  role="menuitem"
                  type="button"
                  tabIndex={isDisabled ? -1 : 0}
                >
                  <span className={isDisabled ? 'text-gray-400' : 'text-gray-500'}>
                    {action.icon}
                  </span>
                  <span className="flex-1">{action.label}</span>
                  {action.badge && (
                    <span className="text-2xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                      {action.badge}
                    </span>
                  )}
                </button>
              );
            });
          })()}
        </div>,
        document.body
      )}

      {/* Audit Modal */}
      <ClaimAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        claim={row}
      />

      {/* Assign To Modal */}
      <AssignToModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        claim={row}
      />
    </>
  );
};

/**
 * Determine menu state based on claim edit_status
 * Maps claim status to one of four categories: UNASSIGNED, PENDING, ADJUDICATED, IN_PROGRESS
 *
 * @param {Object} row - Claim row data
 * @returns {Object} Menu state with actions array
 */
function getMenuState(row) {
  const isLocked = row.is_locked;
  const editStatus = (row.edit_status || '').toString().toUpperCase();

  // If claim is locked, show limited actions
  if (isLocked) {
    return {
      state: 'LOCKED',
      actions: [
        {
          id: 'view',
          label: 'View',
          icon: <Eye className="w-4 h-4" />,
        },
        { isDivider: true },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: <FileText className="w-4 h-4" />,
        },
      ]
    };
  }

  // State 1: UNASSIGNED - No one assigned yet
  if (editStatus === 'UNASSIGNED' || editStatus === '') {
    return {
      state: 'UNASSIGNED',
      actions: [
        {
          id: 'self-assign-edit',
          label: 'Self-Assign & Edit',
          icon: <UserPlus className="w-4 h-4" />,
        },
        {
          id: 'assign-to',
          label: 'Assign To',
          icon: <UserPlus className="w-4 h-4" />,
        },
        {
          id: 'view',
          label: 'View',
          icon: <Eye className="w-4 h-4" />,
        },
        { isDivider: true },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: <FileText className="w-4 h-4" />,
        },
      ]
    };
  }

  // State 2: PENDING - Assigned but not started
  if (editStatus === 'PENDING' || editStatus === 'ASSIGNED') {
    return {
      state: 'PENDING',
      actions: [
        {
          id: 'self-assign-edit',
          label: 'Self-Assign & Edit',
          icon: <UserPlus className="w-4 h-4" />,
        },
        {
          id: 'reassign-to',
          label: 'Reassign To',
          icon: <RefreshCw className="w-4 h-4" />,
        },
        {
          id: 'view',
          label: 'View',
          icon: <Eye className="w-4 h-4" />,
        },
        { isDivider: true },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: <FileText className="w-4 h-4" />,
        },
      ]
    };
  }

  // State 3: ADJUDICATED/COMPLETED - Work done
  if (['ADJUDICATED', 'COMPLETED', 'RE_ADJUDICATED', 'EDITED'].includes(editStatus)) {
    return {
      state: 'ADJUDICATED',
      actions: [
        {
          id: 're-edit',
          label: 'Re-Edit',
          icon: <RefreshCw className="w-4 h-4" />,
        },
        {
          id: 'view',
          label: 'View',
          icon: <Eye className="w-4 h-4" />,
        },
        { isDivider: true },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: <FileText className="w-4 h-4" />,
        },
      ]
    };
  }

  // State 4: IN_PROGRESS - Editor actively working
  if (editStatus === 'IN_PROGRESS') {
    return {
      state: 'IN_PROGRESS',
      actions: [
        {
          id: 'force-reassign',
          label: 'Force Reassign',
          icon: <AlertTriangle className="w-4 h-4" />
        },
        {
          id: 'self-assign-edit',
          label: 'Self-Assign & Edit',
          icon: <UserPlus className="w-4 h-4" />,
        },
        {
          id: 'view',
          label: 'View',
          icon: <Eye className="w-4 h-4" />,
        },
        { isDivider: true },
        {
          id: 'audit',
          label: 'Audit Log',
          icon: <FileText className="w-4 h-4" />,
        },
      ]
    };
  }

  // Default fallback (treat as unassigned)
  return {
    state: 'DEFAULT',
    actions: [
      {
        id: 'view',
        label: 'View',
        icon: <Eye className="w-4 h-4" />,
      },
      { isDivider: true },
      {
        id: 'audit',
        label: 'Audit Trail',
        icon: <FileText className="w-4 h-4" />,
      },
    ]
  };
}

export default ClaimActionMenu;
