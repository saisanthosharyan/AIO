import type { Metadata } from "next";

import "./globals.css";

import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: {
    default: "AIO",
    template: "%s · AIO",
  },
  description:
    "Everything social, in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="aio-root">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}