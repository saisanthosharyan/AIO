
export const THEME_PRESETS = [
  {
    id: "standard",
    name: "AIO Standard",
    description: "Clean, modern, and balanced.",
    primary: "#6258ED",
    primaryHover: "#5146D4",
    lightBackground: "#F7F8FC",
    lightSurface: "#FFFFFF",
    darkBackground: "#10111D",
    darkSurface: "#1B1D2B",
  },
  {
    id: "prism",
    name: "AIO Prism",
    description: "Vibrant, futuristic, and expressive.",
    primary: "#7958F5",
    primaryHover: "#6343DB",
    lightBackground: "#F7F5FF",
    lightSurface: "#FFFFFF",
    darkBackground: "#171329",
    darkSurface: "#25203D",
  },
  {
    id: "orbit",
    name: "AIO Orbit",
    description: "Midnight blue and cosmic energy.",
    primary: "#356DF3",
    primaryHover: "#2457D3",
    lightBackground: "#F3F7FF",
    lightSurface: "#FFFFFF",
    darkBackground: "#0B1223",
    darkSurface: "#172238",
  },
  {
    id: "aura",
    name: "AIO Aura",
    description: "Soft lavender and elegant simplicity.",
    primary: "#9878E9",
    primaryHover: "#805FD0",
    lightBackground: "#F8F5FF",
    lightSurface: "#FFFFFF",
    darkBackground: "#191428",
    darkSurface: "#28203C",
  },
  {
    id: "ember",
    name: "AIO Ember",
    description: "Warm coral and creative energy.",
    primary: "#EC6957",
    primaryHover: "#D55343",
    lightBackground: "#FFF8F3",
    lightSurface: "#FFFFFF",
    darkBackground: "#211719",
    darkSurface: "#302124",
  },
  {
    id: "pulse",
    name: "AIO Pulse",
    description: "Bold electric lime and dark contrast.",
    primary: "#B8E94F",
    primaryHover: "#A5D33C",
    lightBackground: "#F7F9F1",
    lightSurface: "#FFFFFF",
    darkBackground: "#14181A",
    darkSurface: "#252B2D",
  },
] as const;

export type ThemeId =
  (typeof THEME_PRESETS)[number]["id"];

export type AppearanceMode =
  | "light"
  | "dark"
  | "system";

export type ResolvedAppearance =
  | "light"
  | "dark";

export type DesignStyle = "terra" | "v2" | "paperwave" | "original";

export function isDesignStyle(value: unknown): value is DesignStyle {
  return value === "terra" || value === "v2" || value === "paperwave" || value === "original";
}

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

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  designStyle: "terra",
  theme: "standard",
  appearance: "system",
  customAccent: null,
};

export const THEME_STORAGE_KEY =
  "aio-theme-preferences";

export const LEGACY_THEME_STORAGE_KEY =
  "aio-theme";

export function isThemeId(
  value: unknown,
): value is ThemeId {
  return THEME_PRESETS.some(
    (preset) => preset.id === value,
  );
}

export function isAppearanceMode(
  value: unknown,
): value is AppearanceMode {
  return (
    value === "light" ||
    value === "dark" ||
    value === "system"
  );
}

export function isValidHexColor(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value)
  );
}

export function getThemePreset(themeId: ThemeId) {
  return (
    THEME_PRESETS.find(
      (preset) => preset.id === themeId,
    ) ?? THEME_PRESETS[0]
  );
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

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(
  red: number,
  green: number,
  blue: number,
): string {
  const toHex = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const linearize = (channel: number) => {
    const value = channel / 255;

    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  return (
    0.2126 * linearize(r) +
    0.7152 * linearize(g) +
    0.0722 * linearize(b)
  );
}

export function getReadableTextColor(
  background: string,
): string {
  if (!isValidHexColor(background)) {
    return "#FFFFFF";
  }

  const luminance = getLuminance(background);

  const contrastWithWhite =
    1.05 / (luminance + 0.05);

  const contrastWithDark =
    (luminance + 0.05) / 0.05;

  return contrastWithDark >= contrastWithWhite
    ? "#000000"
    : "#FFFFFF";
}

function getCustomHoverColor(
  hex: string,
  appearance: ResolvedAppearance,
): string {
  const { r, g, b } = hexToRgb(hex);

  const factor = 0.12;

  const adjust = (channel: number) => {
    if (appearance === "dark") {
      return channel + (255 - channel) * factor;
    }

    return channel * (1 - factor);
  };

  return rgbToHex(
    adjust(r),
    adjust(g),
    adjust(b),
  );
}

export function getThemeColors(
  preferences: ThemePreferences,
  resolvedAppearance: ResolvedAppearance,
): ThemeColors {
  const preset = getThemePreset(
    preferences.theme,
  );

  const isDark = resolvedAppearance === "dark";

  const customAccent = isValidHexColor(
    preferences.customAccent,
  )
    ? preferences.customAccent
    : null;

  const isTerra = preferences.designStyle === "terra";

  const terraPrimary = isDark ? "#D3DFC2" : "#25351F";
  const terraPrimaryHover = isDark ? "#E1E9D5" : "#34492B";

  const primary =
    customAccent ??
    (isTerra && preferences.theme === "standard"
      ? terraPrimary
      : preset.primary);

  const primaryHover = customAccent
    ? getCustomHoverColor(
        customAccent,
        resolvedAppearance,
      )
    : isTerra && preferences.theme === "standard"
      ? terraPrimaryHover
      : preset.primaryHover;

  return {
    primary,
    primaryHover,
    primaryForeground:
      getReadableTextColor(primary),
    primaryHoverForeground:
      getReadableTextColor(primaryHover),
    background:
      preferences.designStyle === "terra"
        ? isDark
          ? "#191D18"
          : "#F7F4EE"
        : preferences.designStyle === "paperwave"
        ? isDark
          ? "#211E1B"
          : "#EFE7D6"
        : preferences.designStyle === "v2"
          ? isDark
            ? "#101827"
            : "#F5F7FB"
          : isDark
            ? preset.darkBackground
            : preset.lightBackground,
    surface:
      preferences.designStyle === "terra"
        ? isDark
          ? "#252B23"
          : "#FFFFFF"
        : preferences.designStyle === "paperwave"
        ? isDark
          ? "#302A25"
          : "#FBF7EC"
        : preferences.designStyle === "v2"
          ? isDark
            ? "#192438"
            : "#FFFFFF"
          : isDark
            ? preset.darkSurface
            : preset.lightSurface,
  };
}
