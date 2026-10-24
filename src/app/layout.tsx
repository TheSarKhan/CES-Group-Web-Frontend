import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import { site } from "@/content/site";
import { defaultOgImage } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "CES Group — memarlıq, tikinti, texnika icarəsi və innovativ ekosistem",
    template: "%s | CES Group",
  },
  description: site.description,
  applicationName: site.name,
  // Hər səhifə öz canonical, Open Graph və Twitter məlumatını pageMetadata ilə verir
  openGraph: { type: "website", locale: "az_AZ", siteName: site.name, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", images: [defaultOgImage.url] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export const viewport: Viewport = {
  themeColor: "#1e1e21",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          Əsas məzmuna keç
        </a>
        {children}
      </body>
    </html>
  );
}
