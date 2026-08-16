import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIO — All Your World, One Place",
  description:
    "A calm, intelligent social platform for conversations, ideas, communities and creativity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}