import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anzen Digital Media LLC — The AI House",
  description:
    "The AI House for modern operations. Compliance, Automation, Assistance, Development.",
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
