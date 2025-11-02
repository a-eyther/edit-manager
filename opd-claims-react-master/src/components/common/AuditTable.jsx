import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AuditEventType } from '../../types/api-contracts';

/**
 * Reusable Audit Table Component
 *
 * Displays audit trail entries with expandable details.
 * Used by UserAuditModal and ClaimAuditModal.
 *
 * @param {Object} props
 * @param {Array} props.entries - Audit log entries
 * @param {boolean} props.hideClaimColumn - Whether to hide claim ID column
 * @param {boolean} props.hideUserColumn - Whether to hide user column
 * @returns {JSX.Element}
 */
const AuditTable = ({ entries, hideClaimColumn = false, hideUserColumn = false }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (entryId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedRows(newExpanded);
  };

  // Event type badge colors
  const getEventTypeBadgeColor = (eventType) => {
    const colorMap = {
      [AuditEventType.AI_ADJUDICATION]: 'bg-cyan-100 text-cyan-700',
      [AuditEventType.CLAIM_ASSIGNED]: 'bg-blue-100 text-blue-700',
      [AuditEventType.CLAIM_REASSIGNED]: 'bg-purple-100 text-purple-700',
      [AuditEventType.CLAIM_FORCE_REASSIGNED]: 'bg-orange-100 text-orange-700',
      [AuditEventType.CLAIM_AUTO_REASSIGNED]: 'bg-indigo-100 text-indigo-700',
      [AuditEventType.CLAIM_ADJUDICATED]: 'bg-green-100 text-green-700',
      [AuditEventType.CLAIM_RE_ADJUDICATED]: 'bg-yellow-100 text-yellow-700',
      [AuditEventType.USER_CREATED]: 'bg-emerald-100 text-emerald-700',
      [AuditEventType.USER_ACTIVATED]: 'bg-teal-100 text-teal-700',
      [AuditEventType.USER_DEACTIVATED]: 'bg-red-100 text-red-700',
      [AuditEventType.PASSWORD_RESET_INITIATED]: 'bg-pink-100 text-pink-700'
    };
    return colorMap[eventType] || 'bg-gray-100 text-gray-700';
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No audit entries found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-4 py-3"></th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performed By
            </th>
            {!hideClaimColumn && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claim ID
              </th>
            )}
            {!hideUserColumn && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <>
              {/* Main Row */}
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRowExpansion(entry.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    aria-label={expandedRows.has(entry.id) ? 'Collapse details' : 'Expand details'}
                  >
                    {expandedRows.has(entry.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeBadgeColor(entry.eventType)}`}>
                    {entry.eventType.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{entry.performedByName}</span>
                </td>
                {!hideClaimColumn && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    {entry.claimId ? (
                      <span className="text-sm text-gray-900">{entry.claimId}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                )}
                {!hideUserColumn && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    {entry.userName ? (
                      <span className="text-sm text-gray-900">{entry.userName}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                )}
              </tr>

              {/* Expanded Row */}
              {expandedRows.has(entry.id) && (
                <tr key={`${entry.id}-expanded`}>
                  <td colSpan={hideClaimColumn && hideUserColumn ? 4 : hideClaimColumn || hideUserColumn ? 5 : 6} className="px-6 py-4 bg-gray-50">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Event Details</h4>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                      {entry.changes && Object.keys(entry.changes).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Changes</h4>
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="space-y-2">
                              {Object.entries(entry.changes).map(([field, change]) => (
                                <div key={field} className="flex items-start gap-2 text-xs">
                                  <span className="font-medium text-gray-700 min-w-[120px]">{field}:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-red-600 line-through">{String(change.from)}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-green-600">{String(change.to)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
