import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";

const sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Archivo({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-display",
});

const title = "Anzen Digital Media";
const description = "Anzen Digital Media is an independent studio.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | Anzen",
  },
  description,
  metadataBase: new URL("https://anzendigitalmedia.com"),
  openGraph: {
    title,
    description,
    url: "https://anzendigitalmedia.com",
    siteName: "Anzen Digital Media",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-ink font-sans text-paper antialiased">
        <div className="relative z-10">
          <a
            href="#content"
            className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:bg-paper focus-visible:px-3 focus-visible:py-2 focus-visible:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Skip to content
          </a>
          <SiteNav />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
