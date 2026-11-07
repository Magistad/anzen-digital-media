import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";

const sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const title = "Closepath — Anzen Digital Media";
const description =
  "Closepath is a listing-to-close organization book for solo residential agents. Open it in the browser. $9.99 a month. Cancel anytime.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s — Anzen",
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
  themeColor: "#070708",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="bg-ink font-sans text-paper antialiased">
        <div className="relative z-10">
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
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
