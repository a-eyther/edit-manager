import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
  RefreshCw,
  Trash2
} from 'lucide-react';
import {
  selectNotifications,
  selectUnreadCount,
  selectIsOpen,
  markAsRead,
  markAllAsRead,
  clearAll,
  toggleNotificationCenter,
  closeNotificationCenter,
  removeExpiredNotifications
} from '../../../store/slices/notificationsSlice';
import { NotificationType } from '../../../types/api-contracts';
import ConfirmationModal from '../../common/ConfirmationModal';

/**
 * Notification Center Component
 *
 * Dropdown panel showing recent notifications with badge count.
 * Supports mark as read and clear all functionality.
 *
 * @returns {JSX.Element}
 */
const NotificationCenter = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const isOpen = useSelector(selectIsOpen);
  const panelRef = useRef(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Remove expired notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(removeExpiredNotifications());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dispatch]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        dispatch(closeNotificationCenter());
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, dispatch]);

  const handleToggle = () => {
    dispatch(toggleNotificationCenter());
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    setShowClearConfirmation(true);
  };

  const handleConfirmClearAll = () => {
    dispatch(clearAll());
    setShowClearConfirmation(false);
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    const iconMap = {
      [NotificationType.CLAIM_ASSIGNED]: CheckCircle,
      [NotificationType.CLAIM_REASSIGNED]: RefreshCw,
      [NotificationType.USER_ACTIVATED]: UserCheck,
      [NotificationType.USER_DEACTIVATED]: UserX,
      [NotificationType.PASSWORD_RESET]: AlertCircle,
      [NotificationType.SYSTEM_ALERT]: AlertCircle
    };
    return iconMap[type] || Bell;
  };

  // Get color for notification type
  const getNotificationColor = (type) => {
    const colorMap = {
      [NotificationType.CLAIM_ASSIGNED]: 'text-blue-600 bg-blue-50',
      [NotificationType.CLAIM_REASSIGNED]: 'text-purple-600 bg-purple-50',
      [NotificationType.USER_ACTIVATED]: 'text-green-600 bg-green-50',
      [NotificationType.USER_DEACTIVATED]: 'text-red-600 bg-red-50',
      [NotificationType.PASSWORD_RESET]: 'text-orange-600 bg-orange-50',
      [NotificationType.SYSTEM_ALERT]: 'text-yellow-600 bg-yellow-50'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  // Format relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="relative" ref={panelRef}>
        {/* Bell Button */}
        <button
          onClick={handleToggle}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-2xs
                             font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl
                        border border-gray-200 z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);

                  return (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer
                                  ${!notification.read ? 'bg-blue-50/50' : ''}`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {typeof notification.title === 'string' ? notification.title : 'Notification'}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {typeof notification.message === 'string' ? notification.message : 'Error displaying notification'}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              {getRelativeTime(notification.createdAt)}
                            </span>
                            {notification.claimId && (
                              <span className="text-xs text-gray-500">
                                Claim: {notification.claimId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium w-full text-center">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Clear All Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleConfirmClearAll}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="warning"
      />
    </>
  );
};

export default NotificationCenter;
