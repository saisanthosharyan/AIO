
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
  DEFAULT_THEME_PREFERENCES,
  LEGACY_THEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
  getThemeColors,
  isAppearanceMode,
  isDesignStyle,
  isThemeId,
  isValidHexColor,
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

const ThemeContext =
  createContext<ThemeContextValue | null>(null);

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
}

function getContrastColor(hex: string): string {
  const normalized = hex.replace("#", "");

  const channels = [0, 2, 4].map((start) => {
    const channel =
      parseInt(normalized.slice(start, start + 2), 16) /
      255;

    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  const luminance =
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2];

  return luminance > 0.179 ? "#111827" : "#FFFFFF";
}

function loadThemePreferences(): ThemePreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULT_THEME_PREFERENCES };
  }

  try {
    const stored = window.localStorage.getItem(
      THEME_STORAGE_KEY,
    );

    if (stored) {
      const parsed: unknown = JSON.parse(stored);

      if (
        typeof parsed === "object" &&
        parsed !== null
      ) {
        const data = parsed as Record<string, unknown>;

        return {
          designStyle: isDesignStyle(data.designStyle)
            ? data.designStyle
            : DEFAULT_THEME_PREFERENCES.designStyle,
          theme: isThemeId(data.theme)
            ? data.theme
            : DEFAULT_THEME_PREFERENCES.theme,

          appearance: isAppearanceMode(data.appearance)
            ? data.appearance
            : DEFAULT_THEME_PREFERENCES.appearance,

          customAccent: isValidHexColor(
            data.customAccent,
          )
            ? data.customAccent
            : null,
        };
      }
    }

    const legacyTheme =
      window.localStorage.getItem(
        LEGACY_THEME_STORAGE_KEY,
      );

    if (
      legacyTheme === "light" ||
      legacyTheme === "dark"
    ) {
      return {
        ...DEFAULT_THEME_PREFERENCES,
        appearance: legacyTheme,
      };
    }
  } catch {
    // Use default preferences if storage is unavailable.
  }

  return { ...DEFAULT_THEME_PREFERENCES };
}

function applyThemeToDocument(
  preferences: ThemePreferences,
  resolvedAppearance: ResolvedAppearance,
): void {
  const root = document.documentElement;

  const colors = getThemeColors(
    preferences,
    resolvedAppearance,
  );

  const primaryForeground = getContrastColor(
    colors.primary,
  );

  const primaryHoverForeground = getContrastColor(
    colors.primaryHover,
  );

  root.dataset.theme = resolvedAppearance;
  root.dataset.aioStyle = preferences.designStyle;
  root.dataset.aioTheme = preferences.theme;

  root.style.colorScheme = resolvedAppearance;

  const variables: Record<string, string> = {
    "--aio-primary": colors.primary,
    "--aio-primary-hover": colors.primaryHover,

    "--aio-primary-foreground": primaryForeground,
    "--aio-primary-hover-foreground":
      primaryHoverForeground,

    "--aio-bg": colors.background,
    "--aio-surface": colors.surface,

    "--aio-primary-soft": `color-mix(in srgb, ${colors.primary} 12%, ${colors.surface})`,

    "--aio-accent": colors.primary,

    "--brand": colors.primary,
    "--brand-hover": colors.primaryHover,
    "--surface": colors.surface,
    "--soft": colors.background,

    "--canvas-accent": colors.primary,
    "--canvas-accent-soft": `color-mix(in srgb, ${colors.primary} 12%, ${colors.surface})`,
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
  const [preferences, setPreferences] =
    useState<ThemePreferences>({
      ...DEFAULT_THEME_PREFERENCES,
    });

  const [
    systemPrefersDark,
    setSystemPrefersDark,
  ] = useState(false);

  const [initialized, setInitialized] =
    useState(false);

  const resolvedAppearance = resolveAppearance(
    preferences.appearance,
    systemPrefersDark,
  );

  const isDark = resolvedAppearance === "dark";

  useEffect(() => {
    setPreferences(loadThemePreferences());
    setSystemPrefersDark(getSystemPrefersDark());
    setInitialized(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    function handleSystemChange(
      event: MediaQueryListEvent,
    ) {
      setSystemPrefersDark(event.matches);
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemChange,
      );
    };
  }, []);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    applyThemeToDocument(
      preferences,
      resolvedAppearance,
    );

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify(preferences),
      );
    } catch {
      // Theme changes still work without local storage.
    }
  }, [preferences, resolvedAppearance, initialized]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (
        event.key === THEME_STORAGE_KEY ||
        event.key === null
      ) {
        setPreferences(loadThemePreferences());
      }
    }

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, []);

  const setTheme = useCallback((theme: ThemeId) => {
    setPreferences((previous) => ({
      ...previous,
      theme,
    }));
  }, []);

  const setDesignStyle = useCallback(
    (style: DesignStyle) => {
      setPreferences((previous) => ({
        ...previous,
        designStyle: style,
      }));
    },
    [],
  );

  const setAppearance = useCallback(
    (appearance: AppearanceMode) => {
      setPreferences((previous) => ({
        ...previous,
        appearance,
      }));
    },
    [],
  );

  const setCustomAccent = useCallback(
    (color: string | null) => {
      if (
        color !== null &&
        !isValidHexColor(color)
      ) {
        return;
      }

      setPreferences((previous) => ({
        ...previous,
        customAccent: color,
      }));
    },
    [],
  );

  const resetTheme = useCallback(() => {
    setPreferences({
      ...DEFAULT_THEME_PREFERENCES,
    });
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
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}
