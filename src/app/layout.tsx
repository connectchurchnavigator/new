import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import RouteLoadingIndicator from "@/components/layout/RouteLoadingIndicator";
import CookieConsentBanner from "@/components/layout/CookieConsentBanner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.churchnavigator.com"),
  title: {
    default: "ChurchNavigator — Discover Churches, Pastors & Faith Events",
    template: "%s | ChurchNavigator",
  },
  description: "Find and connect with Christian churches, pastors, worship leaders, and faith events across the UK and worldwide on ChurchNavigator.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.churchnavigator.com",
    siteName: "ChurchNavigator",
    title: "ChurchNavigator — Discover Churches, Pastors & Faith Events",
    description: "Find and connect with Christian churches, pastors, worship leaders, and faith events.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ChurchNavigator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChurchNavigator — Discover Churches, Pastors & Faith Events",
    description: "Find and connect with Christian churches, pastors, worship leaders, and faith events.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RouteLoadingIndicator />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" precedence="default" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" precedence="default" />
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="afterInteractive" />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
