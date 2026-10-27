import "@fontsource-variable/manrope";
import "@/app/globals.css";
import { Analytics } from "@/components/Analytics";
import { htmlLang, type Lang } from "@/lib/i18n";

const SKIP: Record<Lang, string> = {
  az: "Əsas məzmuna keç",
  en: "Skip to main content",
  ru: "Перейти к основному содержимому",
};

/** Bütün kök layout-ların ortaq <html>/<body> qabığı (əsas sayt, subsaytlar və admin ayrı kök layout-lardır) */
export function RootShell({ lang = "az", children }: { lang?: Lang; children: React.ReactNode }) {
  return (
    <html lang={htmlLang[lang]} data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          {SKIP[lang]}
        </a>
        {children}
        <Analytics lang={lang} />
      </body>
    </html>
  );
}
