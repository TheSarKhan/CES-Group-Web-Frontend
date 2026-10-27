import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  applySession,
  backendUrl,
  clearSession,
  forwardHeaders,
  isAdminHost,
  jsonError,
  refreshSession,
  sameOrigin,
  type Session,
} from "@/lib/admin/server";

/** Brauzerə açıq olan backend yolları. Giriş, yenilənmə və çıxış ayrıca route-lardadır. */
const LEGACY_MODULES = ["faqs", "clients", "offerings", "projects", "testimonials", "fleet", "uploads", "trash"];

function allowed(path: string) {
  if (path === "iam" || path.startsWith("iam/") || path === "panel" || path.startsWith("panel/")) return true;
  // Equipment məzmun modulları (backend hər birini modul + əməliyyat + sayt üzrə yoxlayır)
  if (LEGACY_MODULES.some((m) => path === `admin/${m}` || path.startsWith(`admin/${m}/`))) return true;
  return path === "auth/me" || path === "auth/profile" || path.startsWith("auth/2fa/");
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  if (!isAdminHost(req.headers.get("host"))) return jsonError(404, "Not found");
  const isRead = req.method === "GET" || req.method === "HEAD";
  if (!isRead && !sameOrigin(req)) return jsonError(403, "Forbidden");

  const path = (await ctx.params).path.join("/");
  if (!allowed(path)) return jsonError(404, "Not found");

  // Şəkil yükləmə multipart-dır: bayt-bayt olduğu kimi, orijinal Content-Type ilə ötürülür
  const contentType = req.headers.get("content-type") ?? "";
  const multipart = contentType.startsWith("multipart/form-data");
  const body = isRead ? undefined : multipart ? await req.arrayBuffer() : await req.text();
  const url = backendUrl(path) + req.nextUrl.search;
  const call = (token: string) =>
    fetch(url, {
      method: req.method,
      headers: { ...forwardHeaders(req), ...(multipart ? { "Content-Type": contentType } : {}), Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });

  const at = req.cookies.get(ACCESS_COOKIE)?.value;
  const rt = req.cookies.get(REFRESH_COOKIE)?.value;
  let renewed: Session | null = null;
  let upstream: Response | null = null;

  try {
    upstream = at ? await call(at) : null;
    if ((!upstream || upstream.status === 401) && rt) {
      renewed = await refreshSession(req, rt);
      if (renewed) upstream = await call(renewed.token);
    }
  } catch {
    return jsonError(502, "Server əlçatmazdır. Bir az sonra yenidən yoxlayın.");
  }

  let res: NextResponse;
  let session: Session | null = renewed;
  if (!upstream) {
    res = jsonError(401, "Unauthorized");
  } else {
    const text = await upstream.text();
    if (path === "auth/profile" && upstream.ok) {
      // Profil yenilənəndə yeni tokenlər verilir: cookie-yə yazılır, brauzerə yalnız istifadəçi qaytarılır
      session = JSON.parse(text) as Session;
      res = NextResponse.json(session.user);
    } else if (upstream.status === 204 || text === "") {
      res = new NextResponse(null, { status: upstream.status });
    } else {
      // CSV eksportu kimi cavablarda backend-in Content-Type və Content-Disposition başlıqları saxlanılır
      const headers: Record<string, string> = { "Content-Type": upstream.headers.get("content-type") ?? "application/json" };
      const disposition = upstream.headers.get("content-disposition");
      if (disposition) headers["Content-Disposition"] = disposition;
      res = new NextResponse(text, { status: upstream.status, headers });
    }
  }

  if (session) applySession(res, session);
  else if (res.status === 401) clearSession(res);
  return res;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
