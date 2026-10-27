"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUi } from "@/i18n/ui";
import { isLang, localePath } from "@/lib/i18n";
import styles from "@/components/subsite/Pages.module.css";

/** 404 marşrutun dilini bilmir, ona görə dil ünvandan (/en/..., /ru/...) oxunur */
export default function SubSiteNotFound() {
  const first = usePathname().split("/")[1] ?? "";
  const lang = isLang(first) ? first : "az";
  const t = getUi(lang).notFound;
  return (
    <div className={styles.notFound}>
      <h1 className="h1">{t.title}</h1>
      <p className="lead">{t.text}</p>
      <Link href={localePath(lang, "/")} className="btn btn-dark">
        {t.back}
      </Link>
    </div>
  );
}
