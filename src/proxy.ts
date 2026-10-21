import { NextResponse, type NextRequest } from "next/server";
import { isSubSiteId } from "@/content/subsites";

/** Subdomain saytları ümumi domen və ya lokal `*.localhost` altında işləyir */
const BASE_HOSTS = new Set(["cesgroup.az", "localhost"]);

function subsiteOf(host: string | null) {
  const [name, ...rest] = (host ?? "").split(":")[0].toLowerCase().split(".");
  return rest.length > 0 && BASE_HOSTS.has(rest.join(".")) && isSubSiteId(name) ? name : null;
}

/**
 * construction.cesgroup.az və farmart.cesgroup.az eyni tətbiqdən xidmət göstərir:
 * host-a görə sorğu /s/<sayt>/... marşrutuna yazılır. Brauzerdə ünvan dəyişmir.
 * /s/... ünvanına birbaşa giriş bağlıdır ki, eyni məzmun iki ünvanda görünməsin.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const site = subsiteOf(req.headers.get("host"));

  if (pathname === "/s" || pathname.startsWith("/s/")) {
    return NextResponse.rewrite(new URL("/_not-found", req.url));
  }
  if (!site) return NextResponse.next();

  // "sitemap.xml" adlı qovluq Next-in metadata konvensiyası ilə toqquşur, ona görə route "sitemap-xml"-dir
  const path = pathname === "/sitemap.xml" ? "/sitemap-xml" : pathname === "/" ? "" : pathname;
  const url = req.nextUrl.clone();
  url.pathname = `/s/${site}${path}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Statik fayllar və API subdomain-lərdə də kökdən xidmət olunur
  matcher: ["/((?!_next/|api/|media/|icon\\.svg).*)"],
};
