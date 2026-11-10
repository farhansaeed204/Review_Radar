import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewRadar — Understand any review in seconds",
  description:
    "Paste a customer review and get a sentiment prediction, a clear explanation, and a polite reply you can send.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
