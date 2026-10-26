export const AIO_VOLT = {
  primary: "#B8F04A",
  primaryHover: "#A8E238",
  primaryHoverDark: "#CBF67A",
  onPrimary: "#171A17",

  light: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    secondarySurface: "#F7F8F5",
    raised: "#EEF0EA",
    text: "#171A17",
    muted: "#6A7068",
    border: "#E7EAE3",
  },

  dark: {
    background: "#121412",
    surface: "#1C1F1B",
    secondarySurface: "#242824",
    raised: "#242824",
    text: "#F5F6F2",
    muted: "#A4AAA0",
    border: "#343934",
  },
} as const;

export type AppearanceMode = "light" | "dark";
export type ResolvedAppearance = AppearanceMode;

export interface ThemePreferences {
  appearance: AppearanceMode;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  primaryHoverForeground: string;
  background: string;
  surface: string;
}

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  appearance: "light",
};

export const THEME_STORAGE_KEY = "aio-volt-preferences";
export const LEGACY_THEME_STORAGE_KEY = "aio-theme";

export function isAppearanceMode(
  value: unknown,
): value is AppearanceMode {
  return value === "light" || value === "dark";
}

export function getThemeColors(
  appearance: ResolvedAppearance,
): ThemeColors {
  const dark = appearance === "dark";
  const palette = dark ? AIO_VOLT.dark : AIO_VOLT.light;

  return {
    primary: AIO_VOLT.primary,
    primaryHover: dark
      ? AIO_VOLT.primaryHoverDark
      : AIO_VOLT.primaryHover,
    primaryForeground: AIO_VOLT.onPrimary,
    primaryHoverForeground: AIO_VOLT.onPrimary,
    background: palette.background,
    surface: palette.surface,
  };
}