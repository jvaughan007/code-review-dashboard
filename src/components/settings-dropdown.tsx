"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, Bell, Keyboard, X } from "lucide-react";
import { NotificationSettings } from "./notification-settings";
import { KeyboardShortcutsSettings } from "./keyboard-shortcuts-settings";

type SettingsTab = "notifications" | "shortcuts";

interface SettingsDropdownProps {
  className?: string;
}

/**
 * SettingsDropdown - Dropdown panel for user settings
 *
 * Features:
 * - Settings icon button in header
 * - Dropdown panel with tabs
 * - Notification preferences tab
 * - Keyboard shortcuts tab
 * - Click outside to close
 */
export function SettingsDropdown({ className = "" }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const tabs: { id: SettingsTab; label: string; icon: typeof Bell }[] = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Settings button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: isOpen ? 'hsl(var(--muted))' : 'transparent',
          color: isOpen
            ? 'hsl(var(--foreground))'
            : 'hsl(var(--muted-foreground))',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
            e.currentTarget.style.color = 'hsl(var(--foreground))';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
          }
        }}
        aria-label="Settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Settings size={20} />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[360px] sm:w-[420px] max-h-[calc(100vh-100px)] rounded-xl shadow-lg border overflow-hidden z-50"
          style={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
          role="dialog"
          aria-label="Settings panel"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{
              borderColor: 'hsl(var(--border))',
              backgroundColor: 'hsl(var(--muted))',
            }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Settings
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
                e.currentTarget.style.color = 'hsl(var(--foreground))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
              }}
              aria-label="Close settings"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-2.5
                  text-sm font-medium
                  transition-colors
                  ${activeTab === id ? 'border-b-2 -mb-px' : ''}
                `}
                style={{
                  color:
                    activeTab === id
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                  borderColor:
                    activeTab === id ? 'hsl(var(--primary))' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== id) {
                    e.currentTarget.style.color = 'hsl(var(--foreground))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== id) {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                  }
                }}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`${id}-panel`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div
            className="p-4 overflow-y-auto max-h-[400px]"
            role="tabpanel"
            id={`${activeTab}-panel`}
          >
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "shortcuts" && <KeyboardShortcutsSettings />}
          </div>
        </div>
      )}
    </div>
  );
}
