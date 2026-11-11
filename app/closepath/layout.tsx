import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { NativeShellProvider } from "../../components/NativeShell";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../../lib/native-shell";

export async function generateMetadata(): Promise<Metadata> {
  const inApp = nativeShellHidesStoreBilling(nativePlatformFromUserAgent(headers().get("user-agent")));
  if (!inApp) return {};
  return {
    description: "Closepath is a listing-to-close organization book for solo residential agents.",
  };
}

export default function ClosepathLayout({ children }: { children: ReactNode }) {
  const platform = nativePlatformFromUserAgent(headers().get("user-agent"));
  return <NativeShellProvider platform={platform}>{children}</NativeShellProvider>;
}
