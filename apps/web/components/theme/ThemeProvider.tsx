
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
  if (typeof window === "undefined") {
    return { ...DEFAULT_THEME_PREFERENCES };
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored) {
      const parsed: unknown = JSON.parse(stored);

      if (
        parsed &&
        typeof parsed === "object" &&
        "appearance" in parsed
      ) {
        const appearance = (parsed as Record<string, unknown>)
          .appearance;

        if (isAppearanceMode(appearance)) {
          return { appearance };
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
    // Use the default appearance if storage is unavailable or invalid.
  }

  return { ...DEFAULT_THEME_PREFERENCES };
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

    "--aio-primary-soft": `color-mix(in srgb, ${AIO_VOLT.primary} 12%, ${palette.surface})`,

    "--aio-accent": AIO_VOLT.primary,
    "--brand": AIO_VOLT.primary,
    "--brand-hover": colors.primaryHover,
    "--surface": palette.surface,
    "--soft": palette.secondarySurface,
    "--canvas-accent": AIO_VOLT.primary,
    "--canvas-accent-soft": `color-mix(in srgb, ${AIO_VOLT.primary} 12%, ${palette.surface})`,
  };

  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState<ThemePreferences>(
    { ...DEFAULT_THEME_PREFERENCES },
  );

  const [initialized, setInitialized] = useState(false);

  // Load the saved appearance when the provider mounts.
  useEffect(() => {
    const savedPreferences = loadPreferences();

    setPreferences(savedPreferences);
    applyTheme(savedPreferences.appearance);
    setInitialized(true);
  }, []);

  // Apply and save the selected appearance.
  useEffect(() => {
    if (!initialized) return;

    applyTheme(preferences.appearance);

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify(preferences),
      );

      window.localStorage.setItem(
        LEGACY_THEME_STORAGE_KEY,
        preferences.appearance,
      );
    } catch {
      // The selected appearance remains active for this session.
    }
  }, [preferences, initialized]);

  // Synchronize appearance changes across browser tabs.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === THEME_STORAGE_KEY ||
        event.key === LEGACY_THEME_STORAGE_KEY ||
        event.key === null
      ) {
        const savedPreferences = loadPreferences();

        setPreferences(savedPreferences);
        applyTheme(savedPreferences.appearance);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setAppearance = useCallback(
    (appearance: AppearanceMode) => {
      setPreferences({ appearance });
    },
    [],
  );

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
