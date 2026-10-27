"use client";

import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Backend-in ingiliscə sistem mesajları və təsdiq xətaları istifadəçiyə azərbaycanca göstərilir */
const KNOWN: Record<string, string> = {
  "Invalid credentials": "E-poçt və ya parol yanlışdır.",
  "Account is disabled": "Hesab deaktiv edilib.",
  "Validation failed": "Daxil edilən məlumatlar düzgün deyil.",
  "Session expired": "Sessiya bitib. Yenidən daxil olun.",
};

export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const hasBody = init?.body !== undefined;
  const res = await fetch(`/api/admin/${path}`, {
    method: init?.method ?? "GET",
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (res.status === 401 && !path.startsWith("login")) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") window.location.replace("/login");
    throw new ApiError(401, KNOWN["Session expired"]);
  }
  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => null)) as { message?: string; details?: string[] } | null;
  if (!res.ok) {
    const base = json?.message ? (KNOWN[json.message] ?? json.message) : "Xəta baş verdi.";
    throw new ApiError(res.status, json?.details?.length ? `${base} ${json.details.join(", ")}` : base);
  }
  return json as T;
}

type State<T> = { path: string; data?: T; error?: string };

/** GET sorğusu. `path` dəyişəndə və ya reload() çağırılanda yenidən yüklənir. */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<State<T>>({ path: "" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let live = true;
    api<T>(path)
      .then((data) => live && setState({ path, data }))
      .catch((e: Error) => live && setState({ path, error: e.message }));
    return () => {
      live = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const current = path !== null && state.path === path;
  return { data: current ? state.data : undefined, error: current ? state.error : undefined, loading: path !== null && !(current && (state.data !== undefined || state.error)), reload };
}

/** Bakı vaxtı ilə hissələr: brauzerin dilindən və saat qurşağından asılı olmayaraq eyni nəticə */
const parts = (d: Date) => {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const get = (t: string) => f.find((x) => x.type === t)?.value ?? "";
  return { dd: get("day"), mm: get("month"), yyyy: get("year"), hh: get("hour"), min: get("minute") };
};

/** Panelin bütün tarixləri: dd.mm.yyyy HH:mm (Bakı vaxtı) */
export const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const t = parts(d);
  return `${t.dd}.${t.mm}.${t.yyyy} ${t.hh}:${t.min}`;
};

/** Yalnız gün: dd.mm.yyyy. Saf tarixi ("2026-10-27", "20261027") olduğu kimi, vaxtlı ISO damğasını isə Bakı vaxtına görə çevirir. */
export const fmtDay = (v: string | null | undefined) => {
  if (!v) return "—";
  const m = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(v);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const t = parts(d);
  return `${t.dd}.${t.mm}.${t.yyyy}`;
};

