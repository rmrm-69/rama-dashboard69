import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rama Bot Dashboard",
  description: "Manage your Rama Bot server settings, moderation, economy, and more.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
