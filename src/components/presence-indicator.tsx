"use client";

import { usePresence } from '@/lib/hooks/use-presence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * PresenceIndicator - Shows who's currently viewing a PR
 *
 * Features:
 * - Real-time presence updates via database polling
 * - Avatar stack with tooltips
 * - Live count of active viewers
 * - Handles up to 5 visible avatars + count
 */

interface PresenceIndicatorProps {
  prId: string;
  className?: string;
}

export function PresenceIndicator({ prId, className = '' }: PresenceIndicatorProps) {
  const { presence, presenceCount } = usePresence({ prId });

  if (presenceCount === 0) {
    return null;
  }

  const visibleUsers = presence.slice(0, 5);
  const remainingCount = Math.max(0, presenceCount - 5);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <div className="flex items-center -space-x-2">
          {visibleUsers.map((user) => (
            <Tooltip key={user.session_id}>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-background ring-2 ring-primary/20 w-8 h-8">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                  <AvatarFallback className="text-xs">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-semibold">{user.username}</p>
                  {user.current_file && (
                    <p className="text-muted-foreground text-xs">
                      Viewing: {user.current_file}
                      {user.current_line && ` (line ${user.current_line})`}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs capitalize">{user.status}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background ring-2 ring-primary/20">
                  <span className="text-xs font-semibold">+{remainingCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{remainingCount} more viewer{remainingCount > 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span>
          {presenceCount} {presenceCount === 1 ? 'person' : 'people'} viewing
        </span>
      </div>
    </div>
  );
}
