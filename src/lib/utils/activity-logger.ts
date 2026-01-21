import { createClient } from '@/lib/supabase/client';
import type { ActivityType } from '@/lib/stores/activity-store';

interface LogActivityParams {
  prId: string;
  userId: string;
  sessionId: string | null;
  activityType: ActivityType;
  metadata?: Record<string, any>;
}

/**
 * Log a single activity to the database
 *
 * Used for important events like user_joined, user_left, comment_posted
 */
export async function logActivity({
  prId,
  userId,
  sessionId,
  activityType,
  metadata = {},
}: LogActivityParams) {
  const supabase = createClient();

  try {
    const { error } = await supabase.from('activities').insert({
      pr_id: prId,
      user_id: userId,
      session_id: sessionId,
      activity_type: activityType,
      metadata,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[ACTIVITY_LOGGER] Error logging activity:', error);
    }
  } catch (error) {
    console.error('[ACTIVITY_LOGGER] Error in logActivity:', error);
  }
}

// Batch logging for high-frequency events (cursor tracking)
let activityBuffer: LogActivityParams[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

/**
 * Batch log activities (for high-frequency events like cursor_active/cursor_idle)
 *
 * Automatically flushes after 1 second or 10 activities
 */
export function logActivityBatched(params: LogActivityParams) {
  activityBuffer.push(params);

  // Flush after 1 second or 10 activities
  if (activityBuffer.length >= 10) {
    flushActivities();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushActivities, 1000);
  }
}

async function flushActivities() {
  if (activityBuffer.length === 0) return;

  const supabase = createClient();
  const toFlush = [...activityBuffer];
  activityBuffer = [];

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  try {
    const { error } = await supabase
      .from('activities')
      .insert(
        toFlush.map((params) => ({
          pr_id: params.prId,
          user_id: params.userId,
          session_id: params.sessionId,
          activity_type: params.activityType,
          metadata: params.metadata,
          created_at: new Date().toISOString(),
        }))
      );

    if (error) {
      console.error('[ACTIVITY_LOGGER] Error batch logging activities:', error);
    }
  } catch (error) {
    console.error('[ACTIVITY_LOGGER] Error in flushActivities:', error);
  }
}
