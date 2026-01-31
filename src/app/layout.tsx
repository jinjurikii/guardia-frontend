import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL('https://guardiacontent.com'),
  openGraph: {
    title: 'Guardia - Your Social Media, Handled',
    description: 'AI-powered done-for-you social media management for local businesses.',
    url: 'https://guardiacontent.com',
    siteName: 'Guardia',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guardia - Your Social Media, Handled',
    description: 'AI-powered done-for-you social media management for local businesses.',
  },
  title: "Guardia - Your Social Media, Handled",
  description: "AI-powered done-for-you social media management for local businesses.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Guardia",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7c3aed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="facebook-domain-verification" content="fnskltx8b70nq7l351c5s4uyfen8am" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
