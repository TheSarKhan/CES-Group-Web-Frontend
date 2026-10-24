import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Docker image üçün minimal server paketi (.next/standalone)
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      // HTTPS-i brauzerlərdə yadda saxlatdırır (alt domenlərə şamil edilmir)
      { source: "/:path*", headers: [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] },
      // Şəkil və videolar nadir dəyişir: brauzer və CDN uzun müddət saxlasın
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }] },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
