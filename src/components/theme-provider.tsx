"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider - Wraps the app to provide dark mode support
 *
 * Uses next-themes for:
 * - System preference detection
 * - Persistence to localStorage
 * - No flash of wrong theme on load
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
