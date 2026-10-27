import { NextResponse, type NextRequest } from "next/server";
import { isSubSiteId } from "@/content/subsites";

/** Subdomain saytları ümumi domen və ya lokal `*.localhost` altında işləyir */
const BASE_HOSTS = new Set(["cesgroup.az", "localhost"]);

/** admin.cesgroup.az eyni tətbiqdən xidmət göstərir: sorğular /adm/... marşrutuna yazılır */
const ADMIN_HOSTS = new Set(["admin.cesgroup.az", "admin.localhost"]);
const isAdminHost = (host: string | null) => ADMIN_HOSTS.has((host ?? "").split(":")[0].toLowerCase());

function subsiteOf(host: string | null) {
  const [name, ...rest] = (host ?? "").split(":")[0].toLowerCase().split(".");
  return rest.length > 0 && BASE_HOSTS.has(rest.join(".")) && isSubSiteId(name) ? name : null;
}

/**
 * construction.cesgroup.az və farmart.cesgroup.az eyni tətbiqdən xidmət göstərir:
 * host-a görə sorğu /s/<sayt>/... marşrutuna yazılır. Brauzerdə ünvan dəyişmir.
 *
 * Prod (standalone) rejimində rewrite olunmuş sorğu proxy-dən yenidən keçir və bu zaman Host
 * başlığı daxili ünvan (localhost:PORT) olur. Ona görə /s/... yolunun icazəli olduğunu Host yox,
 * rewrite zamanı qoyulan x-subsite başlığı göstərir. Əsas domendə /s/... birbaşa açılmır (404).
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const site = subsiteOf(req.headers.get("host"));
  const marked = req.headers.get("x-subsite");

  // Admin panel: rewrite-dan sonra proxy yenidən işləyir və Host daxili ünvan olur, ona görə x-admin işarəsinə baxılır
  if (pathname === "/adm" || pathname.startsWith("/adm/")) {
    if (req.headers.get("x-admin")) return NextResponse.next();
    return NextResponse.rewrite(new URL("/_not-found", req.url));
  }
  if (isAdminHost(req.headers.get("host"))) {
    const url = req.nextUrl.clone();
    url.pathname = `/adm${pathname === "/" ? "" : pathname}`;
    const headers = new Headers(req.headers);
    headers.set("x-admin", "1");
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (pathname === "/s" || pathname.startsWith("/s/")) {
    if (marked && (pathname === `/s/${marked}` || pathname.startsWith(`/s/${marked}/`))) return NextResponse.next();
    return NextResponse.rewrite(new URL("/_not-found", req.url));
  }
  if (!site) return NextResponse.next();

  // "sitemap.xml" adlı qovluq Next-in metadata konvensiyası ilə toqquşur, ona görə route "sitemap-xml"-dir
  const path = pathname === "/sitemap.xml" ? "/sitemap-xml" : pathname === "/" ? "" : pathname;
  const url = req.nextUrl.clone();
  url.pathname = `/s/${site}${path}`;
  const headers = new Headers(req.headers);
  headers.set("x-subsite", site);
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Statik fayllar və API subdomain-lərdə də kökdən xidmət olunur
  matcher: ["/((?!_next/|api/|media/|icon\\.svg).*)"],
};
