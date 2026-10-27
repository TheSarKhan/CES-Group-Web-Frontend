import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/** Backend məzmunu dərc edəndə saytı bununla yeniləyir. Yalnız ortaq sirri bilən çağıra bilər. */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? "";
  const given = req.headers.get("x-revalidate-secret") ?? "";
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  if (!secret || a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string" && /^content:[a-z0-9:_-]{1,120}$/.test(t)).slice(0, 20) : [];
  for (const t of tags) revalidateTag(t, { expire: 0 });
  return NextResponse.json({ revalidated: tags.length });
}
