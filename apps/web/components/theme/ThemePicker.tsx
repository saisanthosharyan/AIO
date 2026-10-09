"use client";

import {
  Check,
  CircleHelp,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sun,
} from "lucide-react";

import {
  THEME_PRESETS,
  getThemeColors,
  type AppearanceMode,
  type ThemeId,
} from "@/lib/themes";

import { useTheme } from "./ThemeProvider";

const ACCENT_COLORS = [
  "#6258ED",
  "#356DF3",
  "#00A88F",
  "#EC6957",
  "#E85BA5",
  "#E7A12C",
  "#9878E9",
  "#B8E94F",
];

const APPEARANCE_OPTIONS: {
  id: AppearanceMode;
  label: string;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    id: "light",
    label: "Light",
    description: "Bright and clean",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Comfortable in low light",
    icon: Moon,
  },
  {
    id: "system",
    label: "System",
    description: "Match your device",
    icon: Monitor,
  },
];

function ThemePreview({
  themeId,
  selected,
  onClick,
}: {
  themeId: ThemeId;
  selected: boolean;
  onClick: () => void;
}) {
  const preset = THEME_PRESETS.find(
    (item) => item.id === themeId,
  )!;

  return (
    <button
      type="button"
      className={`aio-theme-card ${
        selected ? "is-selected" : ""
      }`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div
        className="aio-theme-card-preview"
        style={{
          background: preset.lightBackground,
        }}
      >
        <div
          className="aio-theme-preview-sidebar"
          style={{
            background: preset.darkBackground,
          }}
        >
          <div
            className="aio-theme-preview-logo"
            style={{
              background: preset.primary,
            }}
          />

          <div className="aio-theme-preview-nav" />
          <div className="aio-theme-preview-nav" />
          <div className="aio-theme-preview-nav" />
        </div>

        <div className="aio-theme-preview-content">
          <div
            className="aio-theme-preview-header"
            style={{
              background: preset.lightSurface,
            }}
          >
            <div
              className="aio-theme-preview-header-line"
              style={{
                background: preset.primary,
              }}
            />
          </div>

          <div
            className="aio-theme-preview-post"
            style={{
              background: preset.lightSurface,
            }}
          >
            <div className="aio-theme-preview-post-top">
              <div
                className="aio-theme-preview-avatar"
                style={{
                  background: preset.primary,
                }}
              />

              <div className="aio-theme-preview-lines">
                <div />
                <div />
              </div>
            </div>

            <div
              className="aio-theme-preview-image"
              style={{
                background: `linear-gradient(135deg, ${preset.primary}, ${preset.primaryHover})`,
              }}
            />

            <div className="aio-theme-preview-post-bottom">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        {selected && (
          <span className="aio-theme-selected-indicator">
            <Check size={15} strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="aio-theme-card-info">
        <div>
          <strong>{preset.name}</strong>
          <span>{preset.description}</span>
        </div>

        <span
          className={`aio-theme-radio ${
            selected ? "is-selected" : ""
          }`}
        >
          {selected && <Check size={13} />}
        </span>
      </div>
    </button>
  );
}

export default function ThemePicker() {
  const {
    preferences,
    resolvedAppearance,
    setTheme,
    setAppearance,
    setCustomAccent,
    resetTheme,
  } = useTheme();

  const selectedPreset = THEME_PRESETS.find(
    (item) => item.id === preferences.theme,
  )!;

  const colors = getThemeColors(
    preferences,
    resolvedAppearance,
  );

  const currentAccent =
    preferences.customAccent ??
    selectedPreset.primary;

  const isDark = resolvedAppearance === "dark";

  return (
    <div className="aio-appearance">
      <div className="aio-appearance-heading">
        <div className="aio-appearance-heading-icon">
          <Palette size={23} />
        </div>

        <div>
          <h2>Personalize your AIO</h2>
          <p>
            Make AIO feel like yours. Choose your
            favorite theme, appearance, and colors.
          </p>
        </div>
      </div>

      <section className="aio-appearance-section">
        <div className="aio-appearance-section-heading">
          <div>
            <span className="aio-appearance-eyebrow">
              YOUR STYLE
            </span>

            <h3>Choose your theme</h3>

            <p>
              Pick a visual style that matches your
              personality.
            </p>
          </div>

          <span className="aio-appearance-count">
            {THEME_PRESETS.length} themes
          </span>
        </div>

        <div className="aio-theme-grid">
          {THEME_PRESETS.map((preset) => (
            <ThemePreview
              key={preset.id}
              themeId={preset.id}
              selected={
                preferences.theme === preset.id
              }
              onClick={() => setTheme(preset.id)}
            />
          ))}
        </div>
      </section>

      <section className="aio-appearance-section">
        <div className="aio-appearance-section-heading">
          <div>
            <span className="aio-appearance-eyebrow">
              DISPLAY
            </span>

            <h3>Appearance mode</h3>

            <p>
              Choose how bright or dark AIO should
              look.
            </p>
          </div>
        </div>

        <div className="aio-appearance-mode-grid">
          {APPEARANCE_OPTIONS.map((option) => {
            const Icon = option.icon;

            const selected =
              preferences.appearance === option.id;

            return (
              <button
                key={option.id}
                type="button"
                className={`aio-appearance-mode ${
                  selected ? "is-selected" : ""
                }`}
                onClick={() =>
                  setAppearance(option.id)
                }
                aria-pressed={selected}
              >
                <div className="aio-appearance-mode-icon">
                  <Icon size={22} />
                </div>

                <strong>{option.label}</strong>

                <span>{option.description}</span>

                {selected && (
                  <div className="aio-appearance-mode-check">
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="aio-appearance-section">
        <div className="aio-appearance-section-heading">
          <div>
            <span className="aio-appearance-eyebrow">
              MAKE IT YOURS
            </span>

            <h3>Accent color</h3>

            <p>
              Customize buttons, highlights, links,
              and active navigation.
            </p>
          </div>

          <SlidersHorizontal
            size={19}
            className="aio-appearance-heading-decoration"
          />
        </div>

        <div className="aio-accent-picker">
          <div className="aio-accent-colors">
            {ACCENT_COLORS.map((color) => {
              const selected =
                currentAccent.toLowerCase() ===
                color.toLowerCase();

              return (
                <button
                  key={color}
                  type="button"
                  className={`aio-accent-swatch ${
                    selected ? "is-selected" : ""
                  }`}
                  style={{
                    backgroundColor: color,
                  }}
                  onClick={() =>
                    setCustomAccent(color)
                  }
                  aria-label={`Choose accent color ${color}`}
                  aria-pressed={selected}
                  title={color}
                >
                  {selected && (
                    <Check
                      size={18}
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="aio-custom-accent">
            <label htmlFor="aio-custom-color">
              Custom color
            </label>

            <div className="aio-custom-accent-controls">
              <input
                id="aio-custom-color"
                type="color"
                value={currentAccent}
                onChange={(event) =>
                  setCustomAccent(
                    event.target.value,
                  )
                }
                aria-label="Choose a custom accent color"
              />

              <span>
                {currentAccent.toUpperCase()}
              </span>

              {preferences.customAccent && (
                <button
                  type="button"
                  className="aio-accent-reset"
                  onClick={() =>
                    setCustomAccent(null)
                  }
                >
                  Use theme default
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="aio-appearance-section">
        <div className="aio-appearance-section-heading">
          <div>
            <span className="aio-appearance-eyebrow">
              LIVE PREVIEW
            </span>

            <h3>See your AIO</h3>

            <p>
              Your changes are applied automatically
              across the application.
            </p>
          </div>
        </div>

        <div
          className="aio-live-preview"
          style={{
            background: colors.background,
            color: isDark
              ? "#F2F3F5"
              : "#14171C",
          }}
        >
          <div className="aio-live-preview-topbar">
            <div
              className="aio-live-preview-brand"
              style={{
                background: colors.primary,
              }}
            >
              A
            </div>

            <div>
              <strong>AIO Messages</strong>
              <span>Theme preview</span>
            </div>

            <div className="aio-live-preview-status">
              <span />
              Online
            </div>
          </div>

          <div
            className="aio-live-preview-chat"
            style={{
              background: colors.surface,
            }}
          >
            <div className="aio-live-preview-message-row">
              <div
                className="aio-live-preview-message incoming"
                style={{
                  background: colors.background,
                  color: isDark
                    ? "#F2F3F5"
                    : "#14171C",
                }}
              >
                Hey! How&apos;s your day going?
              </div>
            </div>

            <div className="aio-live-preview-message-row outgoing">
              <div
                className="aio-live-preview-message outgoing"
                style={{
                  background: colors.primary,
                  color: isDark &&
                    preferences.theme === "pulse" &&
                    !preferences.customAccent
                    ? "#14181A"
                    : "#FFFFFF",
                }}
              >
                Pretty good! Loving this AIO theme ✨
              </div>
            </div>

            <div
              className="aio-live-preview-composer"
              style={{
                background: colors.background,
              }}
            >
              <span>Write a message...</span>

              <div
                style={{
                  background: colors.primary,
                }}
              >
                ↑
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="aio-appearance-footer">
        <div className="aio-appearance-save-note">
          <CircleHelp size={17} />

          <span>
            Your theme preferences are saved
            automatically on this device.
          </span>
        </div>

        <button
          type="button"
          className="aio-appearance-reset"
          onClick={resetTheme}
        >
          <RotateCcw size={17} />
          Reset to default
        </button>
      </div>
    </div>
  );
}