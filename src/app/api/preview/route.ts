import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { PREVIEW_COOKIE } from "@/lib/preview";

/**
 * Panel-dən "Önizlə" düyməsi buraya yönləndirir: ?token=<10 dəqiqəlik işarə>&path=/səhifə
 * Brauzerdə önizləmə rejimi açılır və işarə cookie-yə yazılır; işarə yalnız həmin qeydin qaralamasını açır.
 * ?exit=1 rejimi bağlayır. İşarənin özü burada yoxlanmır, backend yoxlayır (etibarsız işarə dərc olunmuş məzmun göstərir).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const dm = await draftMode();
  const jar = await cookies();

  if (url.searchParams.get("exit")) {
    dm.disable();
    jar.delete(PREVIEW_COOKIE);
    return NextResponse.redirect(new URL(safePath(url.searchParams.get("path")), url));
  }

  const token = url.searchParams.get("token") ?? "";
  if (!isValidPreviewTokenFormat(token)) return new NextResponse("Yanlış işarə", { status: 400 });
  dm.enable();
  const isSecure =
    process.env.NODE_ENV === "production" ||
    req.headers.get("x-forwarded-proto") === "https" ||
    url.protocol === "https:";
  jar.set(PREVIEW_COOKIE, token, { httpOnly: true, secure: isSecure, sameSite: "lax", path: "/", maxAge: 600 });
  const res = NextResponse.redirect(new URL(safePath(url.searchParams.get("path")), url));
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function isValidPreviewTokenFormat(token: string): boolean {
  if (!/^[A-Za-z0-9_-]{12,400}\.[A-Za-z0-9_-]{43}$/.test(token)) return false;
  try {
    const [payloadB64] = token.split(".");
    const decoded = Buffer.from(payloadB64, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 4 || !parts[0] || !parts[1] || !parts[2]) return false;
    const exp = Number(parts[3]);
    const nowSec = Math.floor(Date.now() / 1000);
    return Number.isInteger(exp) && exp >= nowSec && exp <= nowSec + 660;
  } catch {
    return false;
  }
}

/** Yalnız saytın öz daxili yolu (açıq yönləndirmə olmasın) */
function safePath(p: string | null) {
  return p && p.startsWith("/") && !p.startsWith("//") && !p.includes("\\") ? p : "/";
}
