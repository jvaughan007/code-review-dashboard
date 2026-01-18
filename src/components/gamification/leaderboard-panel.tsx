"use client";

import { Trophy, Medal } from 'lucide-react';
import { useGamificationStore, type BadgeType } from '@/lib/stores/gamification-store';

/**
 * LeaderboardPanel - Sprint 8 Story #5
 *
 * Displays weekly leaderboard:
 * - Top 5 reviewers by weekly points
 * - User avatars and badges
 * - Highlights current user
 */

interface LeaderboardPanelProps {
  currentUserId?: string;
  className?: string;
}

const BADGE_ICONS: Record<NonNullable<BadgeType>, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
};

const RANK_STYLES: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  2: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' },
  3: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
};

export function LeaderboardPanel({ currentUserId, className = '' }: LeaderboardPanelProps) {
  const getTopLeaderboard = useGamificationStore((state) => state.getTopLeaderboard);
  const isLoading = useGamificationStore((state) => state.isLoading);

  const top5 = getTopLeaderboard(5);

  if (isLoading) {
    return (
      <div className={`rounded-lg border bg-card p-4 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="h-5 w-5" />
          <span className="text-sm">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (top5.length === 0) {
    return (
      <div className={`rounded-lg border bg-card p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Weekly Leaderboard</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No activity this week yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-card p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Weekly Leaderboard</h3>
      </div>

      <div className="space-y-2">
        {top5.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = entry.userId === currentUserId;
          const rankStyle = RANK_STYLES[rank];

          return (
            <div
              key={entry.userId}
              className={`
                flex items-center gap-3 p-2 rounded-lg transition-colors
                ${isCurrentUser ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-muted/50'}
              `}
            >
              {/* Rank */}
              <div
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                  ${rankStyle ? `${rankStyle.bg} ${rankStyle.text}` : 'bg-muted text-muted-foreground'}
                `}
              >
                {rank <= 3 ? <Medal className="h-4 w-4" /> : rank}
              </div>

              {/* Avatar */}
              {entry.avatarUrl ? (
                <img
                  src={entry.avatarUrl}
                  alt={entry.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {entry.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Name and badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                    {entry.username}
                    {isCurrentUser && <span className="text-xs ml-1">(you)</span>}
                  </span>
                  {entry.badge && (
                    <span className="text-sm">{BADGE_ICONS[entry.badge]}</span>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <span className="font-semibold">{entry.weeklyPoints}</span>
                <span className="text-xs text-muted-foreground ml-1">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground text-center mt-3 pt-2 border-t">
        Resets every Monday
      </div>
    </div>
  );
}
