"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getUi } from "@/i18n/ui";
import { isLang, localePath, type Lang } from "@/lib/i18n";
import { Header } from "./Header";

/**
 * 404 səhifəsi marşrutun dilini bilmir, ona görə dil ünvandan (/en/..., /ru/...) oxunur.
 * Altbilgilər serverdə hazırlanıb gəlir (yalnız tərcüməsi tam olan dillər üçün), burada uyğunu seçilir.
 */
export function NotFoundView({ footers }: { footers: Partial<Record<Lang, ReactNode>> }) {
  const first = usePathname().split("/")[1] ?? "";
  const lang: Lang = isLang(first) && footers[first] ? first : "az";
  const t = getUi(lang).notFound;
  return (
    <>
      <Header lang={lang} />
      <main id="main" className="section">
        <div className="container" style={{ display: "grid", gap: 24, justifyItems: "start", minHeight: "40vh", alignContent: "center" }}>
          <h1 className="h1">{t.title}</h1>
          <p className="lead">{t.text}</p>
          <Link href={localePath(lang, "/")} className="btn btn-dark">
            {t.back}
          </Link>
        </div>
      </main>
      {footers[lang]}
    </>
  );
}
