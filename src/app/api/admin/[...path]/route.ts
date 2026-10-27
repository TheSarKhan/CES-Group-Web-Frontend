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
function allowed(path: string) {
  if (path === "iam" || path.startsWith("iam/")) return true;
  return path === "auth/me" || path === "auth/profile" || path.startsWith("auth/2fa/");
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  if (!isAdminHost(req.headers.get("host"))) return jsonError(404, "Not found");
  const isRead = req.method === "GET" || req.method === "HEAD";
  if (!isRead && !sameOrigin(req)) return jsonError(403, "Forbidden");

  const path = (await ctx.params).path.join("/");
  if (!allowed(path)) return jsonError(404, "Not found");

  const body = isRead ? undefined : await req.text();
  const url = backendUrl(path) + req.nextUrl.search;
  const call = (token: string) =>
    fetch(url, { method: req.method, headers: { ...forwardHeaders(req), Authorization: `Bearer ${token}` }, body, cache: "no-store" });

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
      res = new NextResponse(text, { status: upstream.status, headers: { "Content-Type": "application/json" } });
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
