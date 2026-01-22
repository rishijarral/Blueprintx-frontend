import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BlueprintX - Construction Project Management",
    template: "%s | BlueprintX",
  },
  description:
    "Track construction projects from blueprint to completion. Manage tenders, hire subcontractors, and collaborate seamlessly.",
  keywords: [
    "construction",
    "project management",
    "blueprints",
    "contractors",
    "subcontractors",
    "tenders",
    "bidding",
  ],
  authors: [{ name: "BlueprintX" }],
  creator: "BlueprintX",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blueprintx.com",
    title: "BlueprintX - Construction Project Management",
    description:
      "Track construction projects from blueprint to completion. Manage tenders, hire subcontractors, and collaborate seamlessly.",
    siteName: "BlueprintX",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueprintX - Construction Project Management",
    description:
      "Track construction projects from blueprint to completion. Manage tenders, hire subcontractors, and collaborate seamlessly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
