"use client";

import { ThemeToggle } from "./theme-toggle";
import { SettingsDropdown } from "./settings-dropdown";
import Link from "next/link";

interface HeaderProps {
  showBackLink?: boolean;
  backHref?: string;
  backText?: string;
}

/**
 * Header - Top navigation bar with theme toggle
 *
 * Features:
 * - Dark/light/system theme toggle
 * - Optional back navigation link
 * - Sticky positioning
 */
export function Header({
  showBackLink = false,
  backHref,
  backText,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBackLink && backHref && (
            <Link
              href={backHref}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {backText || "← Back"}
            </Link>
          )}
          <Link
            href="/"
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            Code Review
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <SettingsDropdown />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
