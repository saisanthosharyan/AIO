export const AIO_VOLT = {
  primary: "#F0644F",
  primaryHover: "#DF503C",
  primaryHoverDark: "#FF7965",
  onPrimary: "#25120F",

  light: {
    background: "#FAF9F6",
    surface: "#FFFFFF",
    secondarySurface: "#F3F1ED",
    raised: "#EEEAE4",
    text: "#242321",
    muted: "#77736E",
    border: "#E8E4DE",
  },

  dark: {
    background: "#151515",
    surface: "#1D1D1D",
    secondarySurface: "#242424",
    raised: "#2A2A2A",
    text: "#F5F2EF",
    muted: "#AAA39D",
    border: "#363331",
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
