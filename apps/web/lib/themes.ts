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

export interface ThemePreferences {
  theme: ThemeId;
  appearance: AppearanceMode;
  customAccent: string | null;
}

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
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

export function getThemePreset(
  themeId: ThemeId,
) {
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
    return systemPrefersDark
      ? "dark"
      : "light";
  }

  return appearance;
}

export function getThemeColors(
  preferences: ThemePreferences,
  resolvedAppearance: ResolvedAppearance,
) {
  const preset = getThemePreset(
    preferences.theme,
  );

  const isDark =
    resolvedAppearance === "dark";

  const primary =
    preferences.customAccent ??
    preset.primary;

  const primaryHover =
    preferences.customAccent ??
    preset.primaryHover;

  return {
    primary,
    primaryHover,
    background: isDark
      ? preset.darkBackground
      : preset.lightBackground,
    surface: isDark
      ? preset.darkSurface
      : preset.lightSurface,
  };
}