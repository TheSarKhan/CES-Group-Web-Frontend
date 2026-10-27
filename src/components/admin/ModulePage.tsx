"use client";

import Link from "next/link";
import { useState } from "react";
import { MODULE_LABELS } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { EntityManager, type EntityConfig } from "./EntityManager";
import { categories, clients, faqs, items, offerings, projects, subcategories, testimonials } from "./equipmentEntities";
import { TrashPanel } from "./TrashPage";

/** Hər modulun daxilindəki bölmələr (sekmələr). Hələlik yalnız Texnika saytı üçündür. */
const TABS: Record<string, { label: string; entity?: EntityConfig }[]> = {
  FAQ: [{ label: "Sual-cavab", entity: faqs }],
  PAGES: [
    { label: "Xidmətlər", entity: offerings },
    { label: "Müştərilər", entity: clients },
    { label: "Rəylər", entity: testimonials },
  ],
  PROJECTS: [{ label: "Layihələr", entity: projects }],
  FLEET: [
    { label: "Texnikalar", entity: items },
    { label: "Alt kateqoriyalar", entity: subcategories },
    { label: "Kateqoriyalar", entity: categories },
  ],
  TRASH: [{ label: "Zibil qutusu" }],
};

export const MODULE_SLUGS: Record<string, string> = { faq: "FAQ", pages: "PAGES", projects: "PROJECTS", fleet: "FLEET", trash: "TRASH" };

export function ModulePage({ code, slug }: { code: string; slug: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const moduleCode = MODULE_SLUGS[slug];
  const tabs = moduleCode ? TABS[moduleCode] : undefined;
  const [active, setActive] = useState(0);

  if (!site || !moduleCode || !tabs || code !== "equipment" || !can(moduleCode, "VIEW", code)) {
    return (
      <>
        <h1 className={styles.h1}>Bölmə tapılmadı</h1>
        <p className={styles.sub}>Bu bölmə mövcud deyil, bu sayt üçün hələ qoşulmayıb və ya giriş icazəniz yoxdur.</p>
        <Link href={`/sites/${code}`} className={`${styles.btn} ${styles.btnGhost}`}>
          Geri
        </Link>
      </>
    );
  }

  const current = tabs[Math.min(active, tabs.length - 1)];
  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{MODULE_LABELS[moduleCode]}</h1>
          <p className={styles.sub}>{site.name}</p>
        </div>
        <Link href={`/sites/${code}`} className={`${styles.btn} ${styles.btnGhost}`}>
          {site.name} səhifəsinə qayıt
        </Link>
      </div>
      {tabs.length > 1 && (
        <div className={styles.tabs} role="tablist" style={{ marginBottom: 24 }}>
          {tabs.map((t, i) => (
            <button key={t.label} role="tab" aria-selected={i === active} className={styles.tab} onClick={() => setActive(i)}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      {current.entity ? <EntityManager key={current.entity.id} cfg={current.entity} site={code} /> : <TrashPanel site={code} />}
    </>
  );
}
