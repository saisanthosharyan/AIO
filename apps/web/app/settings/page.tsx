import type { Metadata } from "next";

import {
  Palette,
  Settings2,
  ShieldCheck,
  Bell,
  UserRound,
} from "lucide-react";

import ThemePicker from "@/components/theme/ThemePicker";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Personalize your AIO experience, appearance, and preferences.",
};

export default function SettingsPage() {
  return (
    <section className="aio-settings-page">
      {/* Page introduction */}
      <div className="aio-settings-intro">
        <div className="aio-settings-intro-content">
          <span className="aio-settings-eyebrow">
            YOUR AIO EXPERIENCE
          </span>

          <h1>Settings</h1>

          <p>
            Your space, your style. Personalize how
            AIO looks and feels.
          </p>
        </div>

        <div
          className="aio-settings-intro-icon"
          aria-hidden="true"
        >
          <Settings2 size={26} />
        </div>
      </div>

      {/* Appearance customization */}
      <section
        id="appearance"
        className="aio-settings-panel"
        aria-labelledby="appearance-title"
      >
        <div className="aio-settings-panel-header">
          <div className="aio-settings-panel-icon">
            <Palette size={21} />
          </div>

          <div>
            <h2 id="appearance-title">
              Appearance & Personalization
            </h2>

            <p>
              Choose a theme, customize your colors,
              and make AIO your own.
            </p>
          </div>
        </div>

        <div className="aio-settings-panel-body">
          <ThemePicker />
        </div>
      </section>

      {/* Upcoming settings */}
      <section
        className="aio-settings-more"
        aria-labelledby="more-settings-title"
      >
        <div className="aio-settings-more-heading">
          <div>
            <span className="aio-settings-eyebrow">
              MORE CONTROL
            </span>

            <h2 id="more-settings-title">
              More preferences
            </h2>

            <p>
              Additional settings will become
              available as AIO grows.
            </p>
          </div>
        </div>

        <div className="aio-settings-more-grid">
          <div className="aio-settings-more-card">
            <div className="aio-settings-more-icon">
              <UserRound size={22} />
            </div>

            <h3>Account</h3>

            <p>
              Manage your account details and
              personal information.
            </p>

            <span className="aio-settings-coming-soon">
              Coming soon
            </span>
          </div>

          <div className="aio-settings-more-card">
            <div className="aio-settings-more-icon">
              <ShieldCheck size={22} />
            </div>

            <h3>Privacy & Security</h3>

            <p>
              Control your privacy, security,
              and account protection.
            </p>

            <span className="aio-settings-coming-soon">
              Coming soon
            </span>
          </div>

          <div className="aio-settings-more-card">
            <div className="aio-settings-more-icon">
              <Bell size={22} />
            </div>

            <h3>Notifications</h3>

            <p>
              Customize how and when AIO sends
              you updates.
            </p>

            <span className="aio-settings-coming-soon">
              Coming soon
            </span>
          </div>
        </div>
      </section>

      <footer className="aio-settings-footer">
        <span>AIO — Everything social, in one place.</span>
        <span>Made for your world.</span>
      </footer>
    </section>
  );
}