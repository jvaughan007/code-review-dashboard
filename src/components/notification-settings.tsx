"use client";

import { useState, useCallback } from "react";
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
          <Bell className="text-gray-700" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notification Preferences
          </h3>
        </div>
        <button
          onClick={resetToDefaults}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-sm text-gray-800
            hover:text-gray-900 dark:hover:text-gray-100
            hover:bg-gray-100 dark:hover:bg-gray-800
            rounded-lg transition-colors
          "
          title="Reset to defaults"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Loader2 size={14} className="animate-spin" />
          Loading settings...
        </div>
      )}

      {/* Notification types */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
      <div className="space-y-1 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
  return (
    <div
      className="
        flex items-center justify-between
        p-3 rounded-lg
        hover:bg-gray-50 dark:hover:bg-gray-800/50
        transition-colors
      "
    >
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          className={`mt-0.5 ${
            enabled
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
          <p className="text-xs text-gray-700">
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
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-900
          ${
            enabled
              ? "bg-blue-500 dark:bg-blue-600"
              : "bg-gray-200 dark:bg-gray-700"
          }
          ${isSaving ? "opacity-50 cursor-wait" : "cursor-pointer"}
        `}
        role="switch"
        aria-checked={enabled}
        aria-label={`${label}: ${enabled ? "enabled" : "disabled"}`}
      >
        <span
          className={`
            absolute top-0.5 left-0.5
            w-5 h-5 rounded-full
            bg-white shadow
            transition-transform duration-200
            flex items-center justify-center
            ${enabled ? "translate-x-5" : "translate-x-0"}
          `}
        >
          {isSaving ? (
            <Loader2 size={12} className="animate-spin text-gray-400" />
          ) : enabled ? (
            <Check size={12} className="text-blue-500" />
          ) : null}
        </span>
      </button>
    </div>
  );
}
