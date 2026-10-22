
"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const appearances = [
  {
    id: "light",
    name: "Light",
    description: "A bright, clean interface.",
    Icon: Sun,
  },
  {
    id: "dark",
    name: "Dark",
    description: "A calm, focused interface.",
    Icon: Moon,
  },
] as const;

export default function ThemePicker() {
  const { resolvedAppearance, setAppearance } = useTheme();

  return (
    <div
      className="aio-volt-appearance"
      style={{
        display: "grid",
        gap: 24,
        color: "var(--aio-text, #171A17)",
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
            color: "var(--aio-muted, #6A7068)",
          }}
        >
          Choose how AIO looks. Your signature Volt color
          stays consistent in both modes.
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
        {appearances.map(({ id, name, description, Icon }) => {
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
                  ? "2px solid var(--aio-primary)"
                  : "2px solid var(--aio-border)",
                background: "var(--aio-surface)",
                color: "var(--aio-text)",
                cursor: "pointer",
                transition:
                  "border-color 150ms ease, background 150ms ease",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  height: 120,
                  overflow: "hidden",
                  borderRadius: 9,
                  border: `1px solid ${
                    id === "light" ? "#E7EAE3" : "#343934"
                  }`,
                  background:
                    id === "light" ? "#FFFFFF" : "#121412",
                  display: "grid",
                  gridTemplateColumns: "30% 1fr",
                }}
              >
                <div
                  style={{
                    padding: 10,
                    borderRight: `1px solid ${
                      id === "light" ? "#E7EAE3" : "#343934"
                    }`,
                    display: "grid",
                    alignContent: "start",
                    gap: 9,
                  }}
                >
                  <div
                    style={{
                      width: 25,
                      height: 25,
                      background: "#B8F04A",
                      borderRadius: 7,
                    }}
                  />

                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      style={{
                        height: 7,
                        borderRadius: 3,
                        background:
                          id === "light" ? "#E7EAE3" : "#343934",
                      }}
                    />
                  ))}
                </div>

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
                      background:
                        id === "light" ? "#171A17" : "#F5F6F2",
                    }}
                  />

                  <div
                    style={{
                      height: 47,
                      borderRadius: 7,
                      background:
                        id === "light" ? "#F7F8F5" : "#1C1F1B",
                      border: `1px solid ${
                        id === "light" ? "#E7EAE3" : "#343934"
                      }`,
                    }}
                  />

                  <div
                    style={{
                      width: "45%",
                      height: 7,
                      borderRadius: 3,
                      background: "#B8F04A",
                    }}
                  />
                </div>
              </div>

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
                    color="var(--aio-primary)"
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
        }}
      >
        AIO Volt uses one signature color and two appearances.
        Your selection is saved automatically.
      </p>
    </div>
  );
}
