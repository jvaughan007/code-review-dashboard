import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore, NotificationSettings } from './settings-store';

describe('Settings Store - RED PHASE', () => {
  beforeEach(() => {
    // Reset store between tests
    useSettingsStore.setState({
      notifications: {
        newComments: true,
        mentionedInComment: true,
        prUpdates: true,
        reviewAssigned: true,
        soundEnabled: false,
        browserNotifications: false,
      },
      isLoading: false,
      isSynced: true,
    });
  });

  describe('getNotificationSettings', () => {
    it('should return current notification settings', () => {
      // Act
      const settings = useSettingsStore.getState().getNotificationSettings();

      // Assert
      expect(settings).toBeDefined();
      expect(settings.newComments).toBe(true);
      expect(settings.mentionedInComment).toBe(true);
      expect(settings.prUpdates).toBe(true);
      expect(settings.reviewAssigned).toBe(true);
      expect(settings.soundEnabled).toBe(false);
      expect(settings.browserNotifications).toBe(false);
    });
  });

  describe('updateNotificationSetting', () => {
    it('should update a single notification setting', () => {
      // Act
      useSettingsStore.getState().updateNotificationSetting('newComments', false);

      // Assert
      const settings = useSettingsStore.getState().getNotificationSettings();
      expect(settings.newComments).toBe(false);
      // Other settings unchanged
      expect(settings.mentionedInComment).toBe(true);
    });

    it('should enable sound notifications', () => {
      // Act
      useSettingsStore.getState().updateNotificationSetting('soundEnabled', true);

      // Assert
      const settings = useSettingsStore.getState().getNotificationSettings();
      expect(settings.soundEnabled).toBe(true);
    });

    it('should enable browser notifications', () => {
      // Act
      useSettingsStore.getState().updateNotificationSetting('browserNotifications', true);

      // Assert
      const settings = useSettingsStore.getState().getNotificationSettings();
      expect(settings.browserNotifications).toBe(true);
    });

    it('should mark store as unsynced after local change', () => {
      // Arrange
      expect(useSettingsStore.getState().isSynced).toBe(true);

      // Act
      useSettingsStore.getState().updateNotificationSetting('prUpdates', false);

      // Assert
      expect(useSettingsStore.getState().isSynced).toBe(false);
    });
  });

  describe('setAllNotificationSettings', () => {
    it('should replace all notification settings at once', () => {
      // Arrange
      const newSettings: NotificationSettings = {
        newComments: false,
        mentionedInComment: false,
        prUpdates: false,
        reviewAssigned: false,
        soundEnabled: true,
        browserNotifications: true,
      };

      // Act
      useSettingsStore.getState().setAllNotificationSettings(newSettings);

      // Assert
      const settings = useSettingsStore.getState().getNotificationSettings();
      expect(settings).toEqual(newSettings);
    });

    it('should mark as synced when loading from database', () => {
      // Arrange
      useSettingsStore.setState({ isSynced: false });
      const dbSettings: NotificationSettings = {
        newComments: true,
        mentionedInComment: true,
        prUpdates: true,
        reviewAssigned: true,
        soundEnabled: false,
        browserNotifications: false,
      };

      // Act
      useSettingsStore.getState().setAllNotificationSettings(dbSettings, { fromDatabase: true });

      // Assert
      expect(useSettingsStore.getState().isSynced).toBe(true);
    });
  });

  describe('isNotificationEnabled', () => {
    it('should return true for enabled notification type', () => {
      // Act
      const isEnabled = useSettingsStore.getState().isNotificationEnabled('newComments');

      // Assert
      expect(isEnabled).toBe(true);
    });

    it('should return false for disabled notification type', () => {
      // Arrange
      useSettingsStore.getState().updateNotificationSetting('newComments', false);

      // Act
      const isEnabled = useSettingsStore.getState().isNotificationEnabled('newComments');

      // Assert
      expect(isEnabled).toBe(false);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all settings to default values', () => {
      // Arrange - change settings
      useSettingsStore.getState().setAllNotificationSettings({
        newComments: false,
        mentionedInComment: false,
        prUpdates: false,
        reviewAssigned: false,
        soundEnabled: true,
        browserNotifications: true,
      });

      // Act
      useSettingsStore.getState().resetToDefaults();

      // Assert
      const settings = useSettingsStore.getState().getNotificationSettings();
      expect(settings.newComments).toBe(true);
      expect(settings.mentionedInComment).toBe(true);
      expect(settings.prUpdates).toBe(true);
      expect(settings.reviewAssigned).toBe(true);
      expect(settings.soundEnabled).toBe(false);
      expect(settings.browserNotifications).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should track loading state during sync', () => {
      // Act
      useSettingsStore.getState().setLoading(true);

      // Assert
      expect(useSettingsStore.getState().isLoading).toBe(true);
    });

    it('should clear loading state after sync complete', () => {
      // Arrange
      useSettingsStore.setState({ isLoading: true });

      // Act
      useSettingsStore.getState().setLoading(false);

      // Assert
      expect(useSettingsStore.getState().isLoading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid setting toggles', () => {
      // Act - rapid fire toggles
      useSettingsStore.getState().updateNotificationSetting('newComments', false);
      useSettingsStore.getState().updateNotificationSetting('newComments', true);
      useSettingsStore.getState().updateNotificationSetting('newComments', false);

      // Assert - last value wins
      const isEnabled = useSettingsStore.getState().isNotificationEnabled('newComments');
      expect(isEnabled).toBe(false);
    });

    it('should preserve other settings when updating one', () => {
      // Arrange
      const initialSettings = useSettingsStore.getState().getNotificationSettings();

      // Act
      useSettingsStore.getState().updateNotificationSetting('soundEnabled', true);

      // Assert - all other settings unchanged
      const updatedSettings = useSettingsStore.getState().getNotificationSettings();
      expect(updatedSettings.newComments).toBe(initialSettings.newComments);
      expect(updatedSettings.mentionedInComment).toBe(initialSettings.mentionedInComment);
      expect(updatedSettings.prUpdates).toBe(initialSettings.prUpdates);
      expect(updatedSettings.reviewAssigned).toBe(initialSettings.reviewAssigned);
      expect(updatedSettings.soundEnabled).toBe(true); // changed
      expect(updatedSettings.browserNotifications).toBe(initialSettings.browserNotifications);
    });
  });
});

// Expected Result: ALL TESTS FAIL (settings-store.ts doesn't exist yet)
