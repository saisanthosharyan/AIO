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
  isThemeId,
  isValidHexColor,
  resolveAppearance,
  type AppearanceMode,
  type ResolvedAppearance,
  type ThemeId,
  type ThemePreferences,
} from "@/lib/themes";

interface ThemeContextValue {
  preferences: ThemePreferences;
  resolvedAppearance: ResolvedAppearance;
  isDark: boolean;
  setTheme: (theme: ThemeId) => void;
  setAppearance: (
    appearance: AppearanceMode,
  ) => void;
  setCustomAccent: (
    color: string | null,
  ) => void;
  resetTheme: () => void;
}

const ThemeContext =
  createContext<ThemeContextValue | null>(
    null,
  );

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
}

function loadThemePreferences(): ThemePreferences {
  if (typeof window === "undefined") {
    return {
      ...DEFAULT_THEME_PREFERENCES,
    };
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
        const data = parsed as Record<
          string,
          unknown
        >;

        return {
          theme: isThemeId(data.theme)
            ? data.theme
            : DEFAULT_THEME_PREFERENCES.theme,

          appearance: isAppearanceMode(
            data.appearance,
          )
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

    // Migrate existing AIO light/dark preference.
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
    // Invalid or inaccessible storage:
    // continue using defaults.
  }

  return {
    ...DEFAULT_THEME_PREFERENCES,
  };
}

function applyThemeToDocument(
  preferences: ThemePreferences,
  resolvedAppearance: ResolvedAppearance,
) {
  const root = document.documentElement;

  const colors = getThemeColors(
    preferences,
    resolvedAppearance,
  );

  root.dataset.theme = resolvedAppearance;
  root.dataset.aioTheme = preferences.theme;

  root.style.colorScheme = resolvedAppearance;

  root.style.setProperty(
    "--aio-primary",
    colors.primary,
  );

  root.style.setProperty(
    "--aio-primary-hover",
    colors.primaryHover,
  );

  root.style.setProperty(
    "--aio-bg",
    colors.background,
  );

  root.style.setProperty(
    "--aio-surface",
    colors.surface,
  );

  root.style.setProperty(
    "--aio-primary-soft",
    `color-mix(in srgb, ${colors.primary} 12%, ${colors.surface})`,
  );

  // Compatibility with existing Messages styles.
  root.style.setProperty(
    "--brand",
    colors.primary,
  );

  root.style.setProperty(
    "--brand-hover",
    colors.primaryHover,
  );

  root.style.setProperty(
    "--surface",
    colors.surface,
  );

  root.style.setProperty(
    "--soft",
    colors.background,
  );

  root.style.setProperty(
    "--aio-accent",
    colors.primary,
  );
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

  const resolvedAppearance =
    resolveAppearance(
      preferences.appearance,
      systemPrefersDark,
    );

  const isDark =
    resolvedAppearance === "dark";

  // Load saved preferences when the app starts.
  useEffect(() => {
    setPreferences(
      loadThemePreferences(),
    );

    setSystemPrefersDark(
      getSystemPrefersDark(),
    );

    setInitialized(true);
  }, []);

  // Detect operating-system appearance changes.
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    function handleSystemChange(
      event: MediaQueryListEvent,
    ) {
      setSystemPrefersDark(
        event.matches,
      );
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

  // Apply the selected theme globally.
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
      // The theme still works if storage is blocked.
    }
  }, [
    preferences,
    resolvedAppearance,
    initialized,
  ]);

  // Sync changes made in another browser tab.
  useEffect(() => {
    function handleStorage(
      event: StorageEvent,
    ) {
      if (
        event.key === THEME_STORAGE_KEY ||
        event.key === null
      ) {
        setPreferences(
          loadThemePreferences(),
        );
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

  const setTheme = useCallback(
    (theme: ThemeId) => {
      setPreferences((previous) => ({
        ...previous,
        theme,
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
        setAppearance,
        setCustomAccent,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}