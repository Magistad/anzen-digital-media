"use client";

import { useEffect } from "react";

export function FocusField({ id, when }: { id: string; when: boolean }) {
  useEffect(() => {
    if (!when) return;
    const node = document.getElementById(id);
    if (node instanceof HTMLElement) node.focus();
  }, [id, when]);
  return null;
}
