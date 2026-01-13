import { vi } from 'vitest';

/**
 * Mock Supabase Client
 *
 * Provides a mock implementation of the Supabase client
 * for testing hooks without actual database calls.
 */

export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            user_name: 'testuser',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      },
    }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
};

// Mock createClient function
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock activity logger
vi.mock('@/lib/utils/activity-logger', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

/**
 * Mock Presence Store
 */
export const mockPresenceStore = {
  presence: new Map(),
  currentSessionId: null as string | null,
  setPresence: vi.fn(),
  setCurrentSessionId: vi.fn(),
  getPresenceForPR: vi.fn().mockReturnValue([]),
  getPresenceCount: vi.fn().mockReturnValue(0),
};

/**
 * Mock Cursor Store
 */
export const mockCursorStore = {
  cursors: new Map(),
  myColor: '#FF6B6B',
  setCursors: vi.fn(),
  updateCursor: vi.fn(),
  getCursorsForFile: vi.fn().mockReturnValue([]),
  setMyColor: vi.fn(),
};

/**
 * Mock Comments Store
 */
export const mockCommentsStore = {
  comments: new Map(),
  setComments: vi.fn(),
  addComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
  markError: vi.fn(),
  replaceOptimistic: vi.fn(),
  getComments: vi.fn().mockReturnValue([]),
  getCommentCount: vi.fn().mockReturnValue(0),
  getReplies: vi.fn().mockReturnValue([]),
};

/**
 * Reset all mocks between tests
 */
export function resetAllMocks() {
  vi.clearAllMocks();
  mockPresenceStore.currentSessionId = null;
}
