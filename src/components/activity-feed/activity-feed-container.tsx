"use client";

import { useState } from 'react';
import { Activity, X } from 'lucide-react';
import { ActivityFeed } from './activity-feed';
import { cn } from '@/lib/utils';

interface ActivityFeedContainerProps {
  prId: string;
}

export function ActivityFeedContainer({ prId }: ActivityFeedContainerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed right-4 bottom-4 z-40 rounded-full bg-primary p-3 shadow-lg transition-all hover:scale-110",
          "md:right-8 md:bottom-8",
          isOpen && "hidden"
        )}
        aria-label="Open activity feed"
      >
        <Activity className="h-5 w-5 text-primary-foreground" />
      </button>

      {/* Sidebar overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-full border-l bg-background shadow-2xl transition-transform duration-300",
          "md:w-96",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          backgroundColor: 'hsl(var(--background))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Activity Feed</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 hover:bg-muted"
            aria-label="Close activity feed"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feed content */}
        <ActivityFeed prId={prId} />
      </aside>
    </>
  );
}
