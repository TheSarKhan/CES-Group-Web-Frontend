import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE, backendUrl, clearSession, forwardHeaders, isAdminHost, jsonError, sameOrigin } from "@/lib/admin/server";

export async function POST(req: NextRequest) {
  if (!isAdminHost(req.headers.get("host"))) return jsonError(404, "Not found");
  if (!sameOrigin(req)) return jsonError(403, "Forbidden");

  const rt = req.cookies.get(REFRESH_COOKIE)?.value;
  if (rt) {
    await fetch(backendUrl("auth/logout"), { method: "POST", headers: forwardHeaders(req), body: JSON.stringify({ refreshToken: rt }), cache: "no-store" }).catch(() => undefined);
  }
  const res = new NextResponse(null, { status: 204 });
  clearSession(res);
  return res;
}
