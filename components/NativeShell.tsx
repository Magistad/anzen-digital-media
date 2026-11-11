"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { hideNativeChrome } from "../lib/native-bridge";
import type { NativePlatform } from "../lib/native-shell";

const NativeShellContext = createContext<NativePlatform | null>(null);

export function NativeShellProvider({
  platform,
  children,
}: {
  platform: NativePlatform | null;
  children: ReactNode;
}) {
  useEffect(() => {
    if (platform) void hideNativeChrome();
  }, [platform]);

  return <NativeShellContext.Provider value={platform}>{children}</NativeShellContext.Provider>;
}

export function useNativeShell(): NativePlatform | null {
  return useContext(NativeShellContext);
}
