"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  AIO_VOLT,
  DEFAULT_THEME_PREFERENCES,
  LEGACY_THEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
  getThemeColors,
  isAppearanceMode,
  type AppearanceMode,
  type ThemePreferences,
} from "@/lib/themes";

interface ThemeContextValue {
  preferences: ThemePreferences;
  resolvedAppearance: AppearanceMode;
  isDark: boolean;
  setAppearance: (appearance: AppearanceMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadPreferences(): ThemePreferences {
  const defaults = { ...DEFAULT_THEME_PREFERENCES };

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored) {
      const parsed: unknown = JSON.parse(stored);

      if (parsed && typeof parsed === "object") {
        const data = parsed as Record<string, unknown>;

        if (isAppearanceMode(data.appearance)) {
          return { appearance: data.appearance };
        }
      }
    }

    const legacy = window.localStorage.getItem(
      LEGACY_THEME_STORAGE_KEY,
    );

    if (isAppearanceMode(legacy)) {
      return { appearance: legacy };
    }
  } catch {
    // Fall back to the default appearance.
  }

  return defaults;
}

function applyTheme(appearance: AppearanceMode): void {
  const root = document.documentElement;
  const colors = getThemeColors(appearance);
  const palette =
    appearance === "dark" ? AIO_VOLT.dark : AIO_VOLT.light;

  root.dataset.theme = appearance;
  root.dataset.aioStyle = "volt";
  root.dataset.aioTheme = "standard";
  root.style.colorScheme = appearance;

  const variables: Record<string, string> = {
    "--aio-primary": colors.primary,
    "--aio-primary-hover": colors.primaryHover,
    "--aio-primary-foreground": colors.primaryForeground,
    "--aio-primary-hover-foreground":
      colors.primaryHoverForeground,

    "--aio-bg": palette.background,
    "--aio-surface": palette.surface,
    "--aio-surface-secondary": palette.secondarySurface,
    "--aio-surface-raised": palette.raised,
    "--aio-text": palette.text,
    "--aio-muted": palette.muted,
    "--aio-border": palette.border,

    "--aio-primary-soft":
      `color-mix(in srgb, ${AIO_VOLT.primary} 12%, ${palette.surface})`,

    "--aio-accent": AIO_VOLT.primary,
    "--brand": AIO_VOLT.primary,
    "--brand-hover": colors.primaryHover,
    "--surface": palette.surface,
    "--soft": palette.secondarySurface,
    "--canvas-accent": AIO_VOLT.primary,
    "--canvas-accent-soft":
      `color-mix(in srgb, ${AIO_VOLT.primary} 12%, ${palette.surface})`,
  };

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState<ThemePreferences>({
    ...DEFAULT_THEME_PREFERENCES,
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    applyTheme(preferences.appearance);

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify(preferences),
      );
    } catch {
      // Appearance remains usable without localStorage.
    }
  }, [preferences, initialized]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreferences(loadPreferences());
      }
    };

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setAppearance = useCallback((appearance: AppearanceMode) => {
    setPreferences({ appearance });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        preferences,
        resolvedAppearance: preferences.appearance,
        isDark: preferences.appearance === "dark",
        setAppearance,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}