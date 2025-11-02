import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial state for notifications slice
 */
const initialState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
};

/**
 * Helper function to calculate unread count
 */
const calculateUnreadCount = (notifications) => {
  return notifications.filter(n => !n.read).length;
};

/**
 * Notifications slice
 */
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new notification
    addNotification: (state, action) => {
      const notification = {
        id: action.payload.id || `notif-${Date.now()}-${Math.random()}`,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
        read: false,
        claimId: action.payload.claimId || null,
        userId: action.payload.userId || null,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        expiresAt: action.payload.expiresAt || null,
      };

      // Add to beginning of array (most recent first)
      state.notifications.unshift(notification);
      state.unreadCount = calculateUnreadCount(state.notifications);
    },

    // Mark single notification as read
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = calculateUnreadCount(state.notifications);
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },

    // Remove a single notification
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const index = state.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        state.notifications.splice(index, 1);
        state.unreadCount = calculateUnreadCount(state.notifications);
      }
    },

    // Clear all notifications
    clearAll: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Toggle notification center open/closed
    toggleNotificationCenter: (state) => {
      state.isOpen = !state.isOpen;
    },

    // Open notification center
    openNotificationCenter: (state) => {
      state.isOpen = true;
    },

    // Close notification center
    closeNotificationCenter: (state) => {
      state.isOpen = false;
    },

    // Set notifications (bulk update, useful for initial load)
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = calculateUnreadCount(action.payload);
    },

    // Remove expired notifications
    removeExpiredNotifications: (state) => {
      const now = new Date().toISOString();
      state.notifications = state.notifications.filter(
        notification => !notification.expiresAt || notification.expiresAt > now
      );
      state.unreadCount = calculateUnreadCount(state.notifications);
    },

    // Reset notifications state
    resetNotifications: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAll,
  toggleNotificationCenter,
  openNotificationCenter,
  closeNotificationCenter,
  setNotifications,
  removeExpiredNotifications,
  resetNotifications,
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectIsOpen = (state) => state.notifications.isOpen;

// Compound selectors
export const selectUnreadNotifications = (state) =>
  state.notifications.notifications.filter(n => !n.read);

export const selectReadNotifications = (state) =>
  state.notifications.notifications.filter(n => n.read);

export const selectNotificationsByType = (type) => (state) =>
  state.notifications.notifications.filter(n => n.type === type);

export const selectRecentNotifications = (limit = 5) => (state) =>
  state.notifications.notifications.slice(0, limit);

export const selectHasUnreadNotifications = (state) =>
  state.notifications.unreadCount > 0;

export const selectNotificationById = (notificationId) => (state) =>
  state.notifications.notifications.find(n => n.id === notificationId);

// Export reducer
export default notificationsSlice.reducer;
