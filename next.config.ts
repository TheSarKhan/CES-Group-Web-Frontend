import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next dev AGENTS.md/CLAUDE.md yaratmasın
  agentRules: false,
  // Kök layout-lar ayrıdır (əsas sayt [lang] altında, subsaytlar və admin ayrı), ona görə 404 səhifəsi layout-dan asılı deyil
  experimental: { globalNotFound: true },
  reactStrictMode: true,
  // Docker image üçün minimal server paketi (.next/standalone)
  output: "standalone",
  poweredByHeader: false,
  // Əl ilə yazıla biləcək səhv və ya köhnə ünvanlar düzgün səhifəyə yönləndirilir (404 əvəzinə).
  // Qaydalar host-a bağlıdır, çünki construction/farmart subsaytları eyni tətbiqdən xidmət olunur.
  async redirects() {
    const group = [{ type: "host" as const, value: "cesgroup.az" }];
    const sub = (name: string) => [{ type: "host" as const, value: `${name}.cesgroup.az` }];
    const to = (source: string, destination: string, has: { type: "host"; value: string }[]) => ({ source, destination, has, permanent: true });
    return [
      to("/mexfilik", "/mexfilik-siyaseti", group),
      to("/privacy", "/mexfilik-siyaseti", group),
      to("/sertler", "/istifade-sertleri", group),
      to("/terms", "/istifade-sertleri", group),
      to("/layihelerimiz", "/layiheler", group),
      to("/layihelerimiz/:slug", "/layiheler/:slug", group),
      to("/xidmetlerimiz", "/sirketler", group),
      to("/faq", "/suallar", group),
      to("/about", "/haqqimizda", group),
      to("/contact", "/elaqe", group),
      to("/sirketler/ces-equipment", "/sirketler/equipment", group),
      to("/sirketler/ces-architect", "/sirketler/architect", group),
      to("/sirketler/ces-construction", "/sirketler/construction", group),
      to("/sirketler/agro", "/sirketler/farmart", group),
      // Subsaytlarda hüquqi səhifələr qrupun saytındadır
      ...["construction", "farmart"].flatMap((n) => [
        to("/mexfilik-siyaseti", "https://cesgroup.az/mexfilik-siyaseti", sub(n)),
        to("/istifade-sertleri", "https://cesgroup.az/istifade-sertleri", sub(n)),
        to("/haqqimizda", "/#haqqimizda", sub(n)),
        to("/layiheler", "/layihelerimiz", sub(n)),
      ]),
    ];
  },
  async headers() {
    return [
      // Admin paneli heç vaxt indekslənməsin
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "admin.cesgroup.az" }],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
      // HTTPS-i brauzerlərdə yadda saxlatdırır (alt domenlərə şamil edilmir)
      { source: "/:path*", headers: [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] },
      // Şəkil və videolar nadir dəyişir: brauzer və CDN uzun müddət saxlasın
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }] },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Paneldən yüklənən şəkillər: indiki ünvan (Equipment) və gələcək neytral media ünvanı
    remotePatterns: [
      { protocol: "https", hostname: "equipment.cesgroup.az", pathname: "/uploads/**" },
      { protocol: "https", hostname: "media.cesgroup.az", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
