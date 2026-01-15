import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Settings Store - Manages user notification preferences
 *
 * Architecture: localStorage + Database sync
 * - Settings stored in localStorage for instant access
 * - Synced to database for cross-device consistency
 *
 * Sprint 7: Notification Preferences
 * - Toggle individual notification types
 * - Sound and browser notification settings
 * - Sync status tracking
 */

export interface NotificationSettings {
  newComments: boolean;
  mentionedInComment: boolean;
  prUpdates: boolean;
  reviewAssigned: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
}

export type NotificationKey = keyof NotificationSettings;

const DEFAULT_SETTINGS: NotificationSettings = {
  newComments: true,
  mentionedInComment: true,
  prUpdates: true,
  reviewAssigned: true,
  soundEnabled: false,
  browserNotifications: false,
};

interface SettingsState {
  notifications: NotificationSettings;
  isLoading: boolean;
  isSynced: boolean;

  // Actions
  updateNotificationSetting: (key: NotificationKey, value: boolean) => void;
  setAllNotificationSettings: (settings: NotificationSettings, options?: { fromDatabase?: boolean }) => void;
  resetToDefaults: () => void;
  setLoading: (loading: boolean) => void;

  // Selectors
  getNotificationSettings: () => NotificationSettings;
  isNotificationEnabled: (key: NotificationKey) => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        notifications: { ...DEFAULT_SETTINGS },
        isLoading: false,
        isSynced: true,

        updateNotificationSetting: (key, value) =>
          set((state) => ({
            notifications: {
              ...state.notifications,
              [key]: value,
            },
            isSynced: false, // Mark as unsynced after local change
          })),

        setAllNotificationSettings: (settings, options = {}) =>
          set(() => ({
            notifications: { ...settings },
            isSynced: options.fromDatabase ?? false,
          })),

        resetToDefaults: () =>
          set(() => ({
            notifications: { ...DEFAULT_SETTINGS },
            isSynced: false,
          })),

        setLoading: (loading) => set({ isLoading: loading }),

        getNotificationSettings: () => get().notifications,

        isNotificationEnabled: (key) => get().notifications[key],
      }),
      {
        name: 'settings-store',
        partialize: (state) => ({ notifications: state.notifications }),
      }
    ),
    { name: 'SettingsStore' }
  )
);
