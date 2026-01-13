import { describe, it, expect, beforeEach } from 'vitest';
import { usePresenceStore, type PresenceUser } from './presence-store';

/**
 * Presence Store Tests
 *
 * Tests the Zustand store that manages presence state.
 * These are synchronous, testable functions without Supabase dependencies.
 */

// Helper to create mock presence user
const createMockUser = (overrides: Partial<PresenceUser> = {}): PresenceUser => ({
  id: 'presence-1',
  session_id: 'session-1',
  user_id: 'user-1',
  pr_id: 'owner/repo/1',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  current_file: null,
  current_line: null,
  status: 'viewing',
  last_heartbeat: new Date().toISOString(),
  ...overrides,
});

describe('Presence Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePresenceStore.setState({
      presenceByPR: {},
      currentSessionId: null,
      isLoading: false,
    });
  });

  describe('setPresence', () => {
    it('should set presence for a PR', () => {
      const store = usePresenceStore.getState();
      const users = [createMockUser(), createMockUser({ id: 'presence-2', session_id: 'session-2' })];

      store.setPresence('owner/repo/1', users);

      expect(store.getPresenceForPR('owner/repo/1')).toHaveLength(2);
    });

    it('should replace existing presence data for a PR', () => {
      const store = usePresenceStore.getState();

      // Set initial presence
      store.setPresence('owner/repo/1', [createMockUser()]);
      expect(store.getPresenceForPR('owner/repo/1')).toHaveLength(1);

      // Replace with new presence
      store.setPresence('owner/repo/1', [
        createMockUser({ id: 'new-1' }),
        createMockUser({ id: 'new-2', session_id: 'session-2' }),
      ]);

      expect(store.getPresenceForPR('owner/repo/1')).toHaveLength(2);
    });
  });

  describe('getPresenceForPR', () => {
    it('should return empty array for unknown PR', () => {
      const store = usePresenceStore.getState();

      const result = store.getPresenceForPR('unknown/repo/999');

      expect(result).toEqual([]);
    });

    it('should return presence users for known PR', () => {
      const store = usePresenceStore.getState();
      const user = createMockUser();

      store.setPresence('owner/repo/1', [user]);
      const result = store.getPresenceForPR('owner/repo/1');

      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('testuser');
    });
  });

  describe('getPresenceCount', () => {
    it('should return 0 for unknown PR', () => {
      const store = usePresenceStore.getState();

      expect(store.getPresenceCount('unknown/repo/999')).toBe(0);
    });

    it('should return correct count for known PR', () => {
      const store = usePresenceStore.getState();

      store.setPresence('owner/repo/1', [
        createMockUser(),
        createMockUser({ id: 'p2', session_id: 's2' }),
        createMockUser({ id: 'p3', session_id: 's3' }),
      ]);

      expect(store.getPresenceCount('owner/repo/1')).toBe(3);
    });
  });

  describe('addPresence', () => {
    it('should add a new user to presence', () => {
      const store = usePresenceStore.getState();
      const user = createMockUser();

      store.addPresence(user);

      expect(store.getPresenceForPR('owner/repo/1')).toHaveLength(1);
    });

    it('should update existing user if session_id matches', () => {
      const store = usePresenceStore.getState();
      const user = createMockUser({ status: 'viewing' });

      // Add user
      store.addPresence(user);

      // Update same user (same session_id)
      store.addPresence({ ...user, status: 'commenting' });

      const result = store.getPresenceForPR('owner/repo/1');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('commenting');
    });
  });

  describe('removePresence', () => {
    it('should remove user by session_id', () => {
      const store = usePresenceStore.getState();

      store.setPresence('owner/repo/1', [
        createMockUser({ session_id: 'session-1' }),
        createMockUser({ session_id: 'session-2', id: 'p2' }),
      ]);

      expect(store.getPresenceCount('owner/repo/1')).toBe(2);

      store.removePresence('session-1');

      expect(store.getPresenceCount('owner/repo/1')).toBe(1);
      expect(store.getPresenceForPR('owner/repo/1')[0].session_id).toBe('session-2');
    });
  });

  describe('setCurrentSessionId', () => {
    it('should set current session ID', () => {
      const store = usePresenceStore.getState();

      store.setCurrentSessionId('my-session-123');

      expect(usePresenceStore.getState().currentSessionId).toBe('my-session-123');
    });

    it('should allow setting to null', () => {
      const store = usePresenceStore.getState();

      store.setCurrentSessionId('my-session-123');
      store.setCurrentSessionId(null);

      expect(usePresenceStore.getState().currentSessionId).toBeNull();
    });
  });

  describe('isUserPresent', () => {
    it('should return true if user is present', () => {
      const store = usePresenceStore.getState();

      store.setPresence('owner/repo/1', [createMockUser({ user_id: 'user-123' })]);

      expect(store.isUserPresent('owner/repo/1', 'user-123')).toBe(true);
    });

    it('should return false if user is not present', () => {
      const store = usePresenceStore.getState();

      store.setPresence('owner/repo/1', [createMockUser({ user_id: 'user-123' })]);

      expect(store.isUserPresent('owner/repo/1', 'user-456')).toBe(false);
    });
  });
});
