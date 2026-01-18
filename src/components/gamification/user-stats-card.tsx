"use client";

import { Trophy, Flame, FileCheck, MessageSquare, CheckCircle } from 'lucide-react';
import { useGamificationStore, BADGE_THRESHOLDS, type BadgeType } from '@/lib/stores/gamification-store';

/**
 * UserStatsCard - Sprint 8 Story #5
 *
 * Displays user's gamification stats:
 * - Total points and badge
 * - Current streak
 * - Activity counters (files, comments, PRs)
 */

interface UserStatsCardProps {
  className?: string;
}

const BADGE_COLORS: Record<NonNullable<BadgeType>, { bg: string; text: string; icon: string }> = {
  bronze: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '🥉' },
  silver: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', icon: '🥈' },
  gold: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: '🥇' },
};

function getBadgeProgress(points: number): { current: BadgeType; next: BadgeType | null; progress: number } {
  if (points >= BADGE_THRESHOLDS.GOLD) {
    return { current: 'gold', next: null, progress: 100 };
  }
  if (points >= BADGE_THRESHOLDS.SILVER) {
    const progress = ((points - BADGE_THRESHOLDS.SILVER) / (BADGE_THRESHOLDS.GOLD - BADGE_THRESHOLDS.SILVER)) * 100;
    return { current: 'silver', next: 'gold', progress };
  }
  if (points >= BADGE_THRESHOLDS.BRONZE) {
    const progress = ((points - BADGE_THRESHOLDS.BRONZE) / (BADGE_THRESHOLDS.SILVER - BADGE_THRESHOLDS.BRONZE)) * 100;
    return { current: 'bronze', next: 'silver', progress };
  }
  const progress = (points / BADGE_THRESHOLDS.BRONZE) * 100;
  return { current: null, next: 'bronze', progress };
}

export function UserStatsCard({ className = '' }: UserStatsCardProps) {
  const userStats = useGamificationStore((state) => state.userStats);

  if (!userStats) {
    return (
      <div className={`rounded-lg border bg-card p-4 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="h-5 w-5" />
          <span className="text-sm">Loading stats...</span>
        </div>
      </div>
    );
  }

  const badgeProgress = getBadgeProgress(userStats.totalPoints);
  const badgeStyle = userStats.badge ? BADGE_COLORS[userStats.badge] : null;

  return (
    <div className={`rounded-lg border bg-card p-4 space-y-4 ${className}`}>
      {/* Header with points and badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{userStats.totalPoints}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>
        </div>

        {userStats.badge && badgeStyle && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${badgeStyle.bg}`}>
            <span>{badgeStyle.icon}</span>
            <span className={`text-sm font-medium capitalize ${badgeStyle.text}`}>
              {userStats.badge}
            </span>
          </div>
        )}
      </div>

      {/* Progress to next badge */}
      {badgeProgress.next && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to {badgeProgress.next}</span>
            <span>{Math.round(badgeProgress.progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${badgeProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Streak */}
      <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg">
        <Flame className={`h-5 w-5 ${userStats.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
        <div>
          <span className="font-semibold">{userStats.currentStreak}</span>
          <span className="text-sm text-muted-foreground ml-1">
            day streak {userStats.longestStreak > userStats.currentStreak && `(best: ${userStats.longestStreak})`}
          </span>
        </div>
      </div>

      {/* Activity counters */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-muted/30">
          <FileCheck className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <div className="font-semibold">{userStats.filesReviewed}</div>
          <div className="text-xs text-muted-foreground">Files</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <MessageSquare className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <div className="font-semibold">{userStats.commentsPosted}</div>
          <div className="text-xs text-muted-foreground">Comments</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <CheckCircle className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <div className="font-semibold">{userStats.prsCompleted}</div>
          <div className="text-xs text-muted-foreground">PRs</div>
        </div>
      </div>

      {/* Weekly points */}
      <div className="text-xs text-muted-foreground text-center border-t pt-2">
        {userStats.weeklyPoints} points this week
      </div>
    </div>
  );
}
