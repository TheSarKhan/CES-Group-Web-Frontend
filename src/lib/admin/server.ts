import { NextResponse } from "next/server";

/** Spring backend (iç şəbəkə). Brauzer ona birbaşa getmir, yalnız /api/admin/* BFF-i vasitəsilə. */
export const BACKEND = process.env.ADMIN_API_URL ?? "http://localhost:8080";

export const ACCESS_COOKIE = "ces_at";
export const REFRESH_COOKIE = "ces_rt";
const REFRESH_PATH = "/api/admin";

export type Session = { token: string; expiresAt: string; user: unknown; refreshToken: string | null };

export function isAdminHost(host: string | null) {
  const h = (host ?? "").split(":")[0].toLowerCase();
  return h === "admin.cesgroup.az" || h === "admin.localhost";
}

/** Dəyişdirici sorğular yalnız admin saytının öz səhifəsindən gəlməlidir (SameSite=Strict-ə əlavə qat) */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function applySession(res: NextResponse, s: Session) {
  const secure = process.env.NODE_ENV === "production";
  const maxAge = Math.max(60, Math.floor((Date.parse(s.expiresAt) - Date.now()) / 1000));
  res.cookies.set(ACCESS_COOKIE, s.token, { httpOnly: true, secure, sameSite: "strict", path: "/", maxAge });
  if (s.refreshToken) {
    res.cookies.set(REFRESH_COOKIE, s.refreshToken, { httpOnly: true, secure, sameSite: "strict", path: REFRESH_PATH, maxAge: 60 * 60 * 24 * 30 });
  }
}

export function clearSession(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { path: REFRESH_PATH, maxAge: 0 });
}

/** Backend-in IP üzrə limit və audit üçün real istifadəçi ünvanını görməsi lazımdır */
export function forwardHeaders(req: Request): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  for (const k of ["cf-connecting-ip", "x-forwarded-for", "user-agent"]) {
    const v = req.headers.get(k);
    if (v) h[k] = v;
  }
  return h;
}

export const backendUrl = (path: string) => `${BACKEND}/api/v1/${path}`;

export async function refreshSession(req: Request, refreshToken: string): Promise<Session | null> {
  try {
    const res = await fetch(backendUrl("auth/refresh"), {
      method: "POST",
      headers: forwardHeaders(req),
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Session) : null;
  } catch {
    return null;
  }
}

export const jsonError = (status: number, message: string) => NextResponse.json({ message }, { status });
