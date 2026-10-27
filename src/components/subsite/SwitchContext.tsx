"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

/** Dil seçici: başlıq layout-dadır, səhifənin hansı dillərdə açıq olduğunu isə səhifə bilir. Səhifə `SetSwitcher` ilə bildirir. */
export type Switcher = { path: string; langs: Lang[] };
type Ctx = { switcher: Switcher | null; setSwitcher: (s: Switcher | null) => void };

const SwitchCtx = createContext<Ctx>({ switcher: null, setSwitcher: () => undefined });

export function SwitchProvider({ children }: { children: ReactNode }) {
  const [switcher, setSwitcher] = useState<Switcher | null>(null);
  const value = useMemo(() => ({ switcher, setSwitcher }), [switcher]);
  return <SwitchCtx.Provider value={value}>{children}</SwitchCtx.Provider>;
}

export const useSwitcher = () => useContext(SwitchCtx).switcher;

export function SetSwitcher({ path, langs }: Switcher) {
  const { setSwitcher } = useContext(SwitchCtx);
  const key = langs.join(",");
  useEffect(() => {
    setSwitcher({ path, langs: key.split(",") as Lang[] });
    return () => setSwitcher(null);
  }, [path, key, setSwitcher]);
  return null;
}
