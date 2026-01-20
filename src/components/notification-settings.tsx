"use client";

import React, { useState, useCallback } from "react";
import {
  Bell,
  MessageSquare,
  AtSign,
  GitPullRequest,
  UserPlus,
  Volume2,
  BellRing,
  RotateCcw,
  Check,
  Loader2,
} from "lucide-react";
import {
  useSettingsStore,
  type NotificationKey,
} from "@/lib/stores/settings-store";

interface NotificationSettingsProps {
  className?: string;
}

/**
 * NotificationSettings - Configure notification preferences
 *
 * Features:
 * - Toggle individual notification types
 * - Sound and browser notification toggles
 * - Reset to defaults
 * - Syncs with localStorage (and eventually database)
 */
export function NotificationSettings({
  className = "",
}: NotificationSettingsProps) {
  const {
    notifications,
    updateNotificationSetting,
    resetToDefaults,
    isLoading,
  } = useSettingsStore();

  const [savingKey, setSavingKey] = useState<NotificationKey | null>(null);

  const handleToggle = useCallback(
    async (key: NotificationKey) => {
      setSavingKey(key);
      try {
        updateNotificationSetting(key, !notifications[key]);
        // Simulate async save (would be database sync in production)
        await new Promise((resolve) => setTimeout(resolve, 200));
      } finally {
        setSavingKey(null);
      }
    },
    [notifications, updateNotificationSetting]
  );

  const settingsConfig: {
    key: NotificationKey;
    icon: typeof Bell;
    label: string;
    description: string;
  }[] = [
    {
      key: "newComments",
      icon: MessageSquare,
      label: "New Comments",
      description: "When someone comments on a PR you're reviewing",
    },
    {
      key: "mentionedInComment",
      icon: AtSign,
      label: "Mentions",
      description: "When someone @mentions you in a comment",
    },
    {
      key: "prUpdates",
      icon: GitPullRequest,
      label: "PR Updates",
      description: "When a PR you're reviewing is updated",
    },
    {
      key: "reviewAssigned",
      icon: UserPlus,
      label: "Review Requests",
      description: "When you're assigned to review a PR",
    },
  ];

  const systemSettingsConfig: {
    key: NotificationKey;
    icon: typeof Bell;
    label: string;
    description: string;
  }[] = [
    {
      key: "soundEnabled",
      icon: Volume2,
      label: "Sound Effects",
      description: "Play sounds for notifications",
    },
    {
      key: "browserNotifications",
      icon: BellRing,
      label: "Browser Notifications",
      description: "Show browser notification popups",
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} style={{ color: 'hsl(var(--foreground))' }} />
          <h3
            className="text-lg font-semibold"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Notification Preferences
          </h3>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{ color: 'hsl(var(--foreground))' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Reset to defaults"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          <Loader2 size={14} className="animate-spin" />
          Loading settings...
        </div>
      )}

      {/* Notification types */}
      <div className="space-y-1">
        <h4
          className="text-sm font-medium mb-3"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          Notification Types
        </h4>
        {settingsConfig.map(({ key, icon: Icon, label, description }) => (
          <ToggleRow
            key={key}
            icon={Icon}
            label={label}
            description={description}
            enabled={notifications[key]}
            isSaving={savingKey === key}
            onToggle={() => handleToggle(key)}
          />
        ))}
      </div>

      {/* System settings */}
      <div
        className="space-y-1 pt-4 border-t"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <h4
          className="text-sm font-medium mb-3"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          System Settings
        </h4>
        {systemSettingsConfig.map(({ key, icon: Icon, label, description }) => (
          <ToggleRow
            key={key}
            icon={Icon}
            label={label}
            description={description}
            enabled={notifications[key]}
            isSaving={savingKey === key}
            onToggle={() => handleToggle(key)}
          />
        ))}
      </div>
    </div>
  );
}

// Toggle row component
interface ToggleRowProps {
  icon: typeof Bell;
  label: string;
  description: string;
  enabled: boolean;
  isSaving: boolean;
  onToggle: () => void;
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  enabled,
  isSaving,
  onToggle,
}: ToggleRowProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg transition-colors"
      style={{
        backgroundColor: isHovered ? 'hsl(var(--muted))' : 'transparent',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          className="mt-0.5"
          style={{
            color: enabled
              ? 'hsl(var(--primary))'
              : 'hsl(var(--muted-foreground))',
          }}
        />
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {label}
          </p>
          <p
            className="text-xs"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={isSaving}
        className={`
          relative w-11 h-6 rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isSaving ? "opacity-50 cursor-wait" : "cursor-pointer"}
        `}
        style={{
          backgroundColor: enabled
            ? 'hsl(var(--primary))'
            : 'hsl(var(--muted))',
        }}
        role="switch"
        aria-checked={enabled}
        aria-label={`${label}: ${enabled ? "enabled" : "disabled"}`}
      >
        <span
          className={`
            absolute top-0.5 left-0.5
            w-5 h-5 rounded-full
            bg-white dark:bg-gray-100 shadow
            transition-transform duration-200
            flex items-center justify-center
            ${enabled ? "translate-x-5" : "translate-x-0"}
          `}
        >
          {isSaving ? (
            <Loader2
              size={12}
              className="animate-spin"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            />
          ) : enabled ? (
            <Check size={12} style={{ color: 'hsl(var(--primary))' }} />
          ) : null}
        </span>
      </button>
    </div>
  );
}
