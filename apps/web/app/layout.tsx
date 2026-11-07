import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

import "./globals.css";
import "./aio-volt.css";

import AppShell from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const themeBootstrapScript = `
(() => {
  try {
    let appearance = "light";

    const stored = localStorage.getItem("aio-volt-preferences");

    if (stored) {
      const parsed = JSON.parse(stored);

      if (parsed.appearance === "light" || parsed.appearance === "dark") {
        appearance = parsed.appearance;
      }
    } else {
      const legacy = localStorage.getItem("aio-theme");

      if (legacy === "light" || legacy === "dark") {
        appearance = legacy;
      }
    }

    document.documentElement.dataset.theme = appearance;
    document.documentElement.dataset.aioStyle = "volt";
    document.documentElement.dataset.aioTheme = "standard";
    document.documentElement.style.colorScheme = appearance;
  } catch {
    // Use the default light theme if storage is unavailable.
  }
})();
`;

export const metadata: Metadata = {
  title: {
    default: "AIO",
    template: "%s | AIO",
  },
  description: "Everything social, in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-aio-style="volt"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrapScript,
          }}
        />
      </head>

      <body className="aio-root">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
