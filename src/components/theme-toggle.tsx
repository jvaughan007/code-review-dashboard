"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

/**
 * ThemeToggle - Button to toggle between light, dark, and system themes
 *
 * Features:
 * - Shows current theme state
 * - Cycles through: light → dark → system
 * - Keyboard accessible
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-5 w-5" />;
    }
    if (resolvedTheme === "dark") {
      return <Moon className="h-5 w-5" />;
    }
    return <Sun className="h-5 w-5" />;
  };

  const getLabel = () => {
    if (theme === "system") {
      return `System (${resolvedTheme === "dark" ? "Dark" : "Light"})`;
    }
    return theme === "dark" ? "Dark" : "Light";
  };

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label={`Current theme: ${getLabel()}. Click to change.`}
      title={`Theme: ${getLabel()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}
