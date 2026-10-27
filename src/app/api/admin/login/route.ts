import { NextResponse, type NextRequest } from "next/server";
import { applySession, backendUrl, forwardHeaders, isAdminHost, jsonError, sameOrigin, type Session } from "@/lib/admin/server";

export async function POST(req: NextRequest) {
  if (!isAdminHost(req.headers.get("host"))) return jsonError(404, "Not found");
  if (!sameOrigin(req)) return jsonError(403, "Forbidden");

  let upstream: Response;
  try {
    upstream = await fetch(backendUrl("auth/login"), { method: "POST", headers: forwardHeaders(req), body: await req.text(), cache: "no-store" });
  } catch {
    return jsonError(502, "Server əlçatmazdır. Bir az sonra yenidən yoxlayın.");
  }
  const body = (await upstream.json().catch(() => null)) as (Session & { message?: string }) | null;
  if (!upstream.ok || !body?.token) {
    return NextResponse.json({ message: body?.message ?? "Xəta baş verdi." }, { status: upstream.status });
  }
  // Tokenlər brauzerə JS üçün oxunan şəkildə verilmir, yalnız httpOnly cookie-də saxlanır
  const res = NextResponse.json(body.user);
  applySession(res, body);
  return res;
}
