import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import "@/orpc/server"; // for pre-rendering
import { PROJECT } from "@/constants/project";

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
    default: PROJECT.NAME,
    template: `%s | ${PROJECT.NAME}`,
  },
  description:
    "Create and edit professional proposals with AI-powered assistance. Build beautiful proposals with rich text formatting, drag-and-drop blocks, and intelligent content suggestions.",
  keywords: [
    "proposal",
    "builder",
    "proposal builder",
    "business proposals",
    "document editor",
    "AI proposals",
  ],
  authors: [{ name: "Impulse Lab" }],
  creator: "Impulse Lab",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: PROJECT.NAME,
    title: PROJECT.NAME,
    description:
      "Create and edit professional proposals with AI-powered assistance.",
  },
  twitter: {
    card: "summary_large_image",
    title: PROJECT.NAME,
    description:
      "Create and edit professional proposals with AI-powered assistance.",
  },
  icons: {
    icon: "/favicon.ico",
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
