
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

// Temporary compatibility for existing components.
// These legacy values will be removed after the
// ThemePicker and application shell are migrated.
export type ThemeId =
  | "standard"
  | "prism"
  | "orbit"
  | "aura"
  | "ember"
  | "pulse";

export type DesignStyle =
  | "terra"
  | "v2"
  | "paperwave"
  | "original";

export type AppearanceMode = "light" | "dark" | "system";

export type ResolvedAppearance = "light" | "dark";

export interface ThemePreferences {
  designStyle: DesignStyle;
  theme: ThemeId;
  appearance: AppearanceMode;
  customAccent: string | null;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  primaryHoverForeground: string;
  background: string;
  surface: string;
}

export const THEME_PRESETS = [
  {
    id: "standard",
    name: "AIO Volt",
    description: "The official AIO signature identity.",
    primary: AIO_VOLT.primary,
    primaryHover: AIO_VOLT.primaryHover,
    lightBackground: AIO_VOLT.light.background,
    lightSurface: AIO_VOLT.light.surface,
    darkBackground: AIO_VOLT.dark.background,
    darkSurface: AIO_VOLT.dark.surface,
  },
] as const;

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  designStyle: "original",
  theme: "standard",
  appearance: "light",
  customAccent: null,
};

export const THEME_STORAGE_KEY = "aio-volt-preferences";

export const LEGACY_THEME_STORAGE_KEY = "aio-theme";

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    ["standard", "prism", "orbit", "aura", "ember", "pulse"].includes(value)
  );
}

export function isDesignStyle(value: unknown): value is DesignStyle {
  return (
    value === "terra" ||
    value === "v2" ||
    value === "paperwave" ||
    value === "original"
  );
}

export function isAppearanceMode(
  value: unknown,
): value is AppearanceMode {
  return value === "light" || value === "dark" || value === "system";
}

export function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function getThemePreset(_themeId: ThemeId) {
  return THEME_PRESETS[0];
}

export function resolveAppearance(
  appearance: AppearanceMode,
  systemPrefersDark: boolean,
): ResolvedAppearance {
  if (appearance === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return appearance;
}

export function getReadableTextColor(background: string): string {
  if (!isValidHexColor(background)) {
    return AIO_VOLT.onPrimary;
  }

  const hex = background.slice(1);

  const channels = [0, 2, 4].map((index) => {
    const value = parseInt(hex.slice(index, index + 2), 16) / 255;

    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  const luminance =
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2];

  const whiteContrast = 1.05 / (luminance + 0.05);
  const darkContrast = (luminance + 0.05) / 0.05;

  return darkContrast >= whiteContrast ? "#000000" : "#FFFFFF";
}

export function getThemeColors(
  _preferences: ThemePreferences,
  resolvedAppearance: ResolvedAppearance,
): ThemeColors {
  const dark = resolvedAppearance === "dark";
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
