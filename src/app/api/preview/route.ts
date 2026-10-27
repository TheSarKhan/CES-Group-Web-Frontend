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
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token) || token.length > 600) return new NextResponse("Yanlış işarə", { status: 400 });
  dm.enable();
  jar.set(PREVIEW_COOKIE, token, { httpOnly: true, secure: url.protocol === "https:", sameSite: "lax", path: "/", maxAge: 600 });
  const res = NextResponse.redirect(new URL(safePath(url.searchParams.get("path")), url));
  res.headers.set("Cache-Control", "no-store");
  return res;
}

/** Yalnız saytın öz daxili yolu (açıq yönləndirmə olmasın) */
function safePath(p: string | null) {
  return p && p.startsWith("/") && !p.startsWith("//") && !p.includes("\\") ? p : "/";
}
