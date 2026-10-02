import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import { site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "CES Group — Memarlıq, tikinti, texnika icarəsi və aqro",
    template: "%s | CES Group",
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "az_AZ",
    siteName: "CES Group",
    images: [{ url: "/media/ces-equipment.jpg", width: 1400, height: 933 }],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body>
        <a href="#main" className="skip-link">
          Əsas məzmuna keç
        </a>
        {children}
      </body>
    </html>
  );
}
