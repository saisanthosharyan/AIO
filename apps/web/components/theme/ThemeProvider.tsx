
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
  resolveAppearance,
  type AppearanceMode,
  type DesignStyle,
  type ResolvedAppearance,
  type ThemeId,
  type ThemePreferences,
} from "@/lib/themes";

interface ThemeContextValue {
  preferences: ThemePreferences;
  resolvedAppearance: ResolvedAppearance;
  isDark: boolean;
  setTheme: (theme: ThemeId) => void;
  setDesignStyle: (style: DesignStyle) => void;
  setAppearance: (appearance: AppearanceMode) => void;
  setCustomAccent: (color: string | null) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function loadPreferences(): ThemePreferences {
  const defaults = { ...DEFAULT_THEME_PREFERENCES };

  if (typeof window === "undefined") return defaults;

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored) {
      const parsed: unknown = JSON.parse(stored);

      if (parsed && typeof parsed === "object") {
        const data = parsed as Record<string, unknown>;

        return {
          ...defaults,
          appearance: isAppearanceMode(data.appearance)
            ? data.appearance
            : defaults.appearance,
        };
      }
    }

    const legacy = window.localStorage.getItem(
      LEGACY_THEME_STORAGE_KEY,
    );

    if (legacy === "light" || legacy === "dark") {
      return { ...defaults, appearance: legacy };
    }
  } catch {
    // Use default appearance if storage is unavailable.
  }

  return defaults;
}

function applyTheme(
  preferences: ThemePreferences,
  appearance: ResolvedAppearance,
): void {
  const root = document.documentElement;
  const colors = getThemeColors(preferences, appearance);
  const palette =
    appearance === "dark" ? AIO_VOLT.dark : AIO_VOLT.light;

  root.dataset.theme = appearance;
  root.dataset.aioStyle = "volt";
  root.dataset.aioTheme = "standard";
  root.style.colorScheme = appearance;

  const variables: Record<string, string> = {
    "--aio-primary": colors.primary,
    "--aio-primary-hover": colors.primaryHover,
    "--aio-primary-foreground": AIO_VOLT.onPrimary,
    "--aio-primary-hover-foreground": AIO_VOLT.onPrimary,

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

  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const resolvedAppearance = resolveAppearance(
    preferences.appearance,
    systemPrefersDark,
  );

  const isDark = resolvedAppearance === "dark";

  useEffect(() => {
    setPreferences(loadPreferences());
    setSystemPrefersDark(getSystemPrefersDark());
    setInitialized(true);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    applyTheme(preferences, resolvedAppearance);

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify(preferences),
      );
    } catch {
      // Theme remains usable without localStorage.
    }
  }, [preferences, resolvedAppearance, initialized]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreferences(loadPreferences());
      }
    };

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Compatibility functions retained until legacy UI migration.
  const setTheme = useCallback((_theme: ThemeId) => {
    setPreferences((previous) => ({
      ...previous,
      theme: "standard",
    }));
  }, []);

  const setDesignStyle = useCallback((_style: DesignStyle) => {
    setPreferences((previous) => ({
      ...previous,
      designStyle: "original",
    }));
  }, []);

  const setAppearance = useCallback((appearance: AppearanceMode) => {
    setPreferences((previous) => ({
      ...previous,
      appearance,
    }));
  }, []);

  const setCustomAccent = useCallback((_color: string | null) => {
    setPreferences((previous) => ({
      ...previous,
      customAccent: null,
    }));
  }, []);

  const resetTheme = useCallback(() => {
    setPreferences({ ...DEFAULT_THEME_PREFERENCES });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        preferences,
        resolvedAppearance,
        isDark,
        setTheme,
        setDesignStyle,
        setAppearance,
        setCustomAccent,
        resetTheme,
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
