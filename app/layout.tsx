import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anzen Digital Media LLC — The AI House",
  description:
    "The AI House for modern operations. Compliance, Automation, Assistance, Development.",
  metadataBase: new URL("https://anzendigitalmedia.com"),
  openGraph: {
    title: "Anzen — The AI House",
    description:
      "Production AI across compliance, automation, assistance, and development.",
    url: "https://anzendigitalmedia.com",
    siteName: "Anzen Digital Media LLC",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Anzen — The AI House" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anzen — The AI House",
    description:
      "Production AI across compliance, automation, assistance, and development.",
    images: ["/og.png"],
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#12100d] text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}

