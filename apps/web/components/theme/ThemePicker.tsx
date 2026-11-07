
"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const appearances = [
  {
    id: "light",
    name: "Light",
    description: "A warm, bright and comfortable interface.",
    Icon: Sun,
    preview: {
      background: "#FAF9F6",
      surface: "#FFFFFF",
      secondary: "#F3F1ED",
      border: "#E8E4DE",
      text: "#242321",
      muted: "#77736E",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "A refined, comfortable dark interface.",
    Icon: Moon,
    preview: {
      background: "#151515",
      surface: "#1D1D1D",
      secondary: "#242424",
      border: "#363331",
      text: "#F5F2EF",
      muted: "#AAA39D",
    },
  },
] as const;

const ACCENT = "#F0644F";

export default function ThemePicker() {
  const { resolvedAppearance, setAppearance } = useTheme();

  return (
    <div
      className="aio-volt-appearance"
      style={{
        display: "grid",
        gap: 24,
        color: "var(--aio-text, #242321)",
      }}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.035em",
          }}
        >
          Appearance
        </h3>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--aio-muted, #77736E)",
          }}
        >
          Choose the appearance that feels right for you.
          AIO's signature Persimmon accent stays consistent
          across both modes.
        </p>
      </div>

      <div
        role="group"
        aria-label="Choose appearance"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 14,
        }}
      >
        {appearances.map(({ id, name, description, Icon, preview }) => {
          const selected = resolvedAppearance === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setAppearance(id)}
              aria-pressed={selected}
              style={{
                display: "grid",
                gap: 14,
                padding: 18,
                textAlign: "left",
                borderRadius: 14,
                border: selected
                  ? `2px solid ${ACCENT}`
                  : "2px solid var(--aio-border)",
                background: "var(--aio-surface)",
                color: "var(--aio-text)",
                cursor: "pointer",
                transition:
                  "border-color 150ms ease, background 150ms ease",
              }}
            >
              {/* Appearance preview */}
              <div
                aria-hidden="true"
                style={{
                  height: 120,
                  overflow: "hidden",
                  borderRadius: 9,
                  border: `1px solid ${preview.border}`,
                  background: preview.background,
                  display: "grid",
                  gridTemplateColumns: "30% 1fr",
                }}
              >
                {/* Sidebar preview */}
                <div
                  style={{
                    padding: 10,
                    borderRight: `1px solid ${preview.border}`,
                    display: "grid",
                    alignContent: "start",
                    gap: 9,
                  }}
                >
                  <div
                    style={{
                      width: 25,
                      height: 25,
                      background: ACCENT,
                      borderRadius: 7,
                    }}
                  />

                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      style={{
                        height: 7,
                        borderRadius: 3,
                        background: preview.border,
                      }}
                    />
                  ))}
                </div>

                {/* Content preview */}
                <div
                  style={{
                    padding: 12,
                    display: "grid",
                    alignContent: "start",
                    gap: 11,
                  }}
                >
                  <div
                    style={{
                      width: "75%",
                      height: 10,
                      borderRadius: 4,
                      background: preview.text,
                    }}
                  />

                  <div
                    style={{
                      height: 47,
                      borderRadius: 7,
                      background: preview.surface,
                      border: `1px solid ${preview.border}`,
                    }}
                  />

                  <div
                    style={{
                      width: "45%",
                      height: 7,
                      borderRadius: 3,
                      background: ACCENT,
                    }}
                  />
                </div>
              </div>

              {/* Appearance details */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Icon size={19} aria-hidden="true" />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 650 }}>
                    {name}
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 12,
                      color: "var(--aio-muted)",
                    }}
                  >
                    {description}
                  </div>
                </div>

                {selected && (
                  <Check
                    size={19}
                    color={ACCENT}
                    aria-hidden="true"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--aio-muted)",
          lineHeight: 1.6,
        }}
      >
        AIO brings both appearances together with one
        consistent identity. Your selection is saved automatically.
      </p>
    </div>
  );
}
