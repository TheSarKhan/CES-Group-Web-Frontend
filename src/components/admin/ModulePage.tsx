"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { MODULE_LABELS } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { EntityEditor } from "./EntityEditor";
import { EntityList } from "./EntityList";
import type { EntityConfig } from "./EntityManager";
import { categories, clients, faqs, items, offerings, projects, subcategories, testimonials } from "./equipmentEntities";
import { TrashPanel } from "./TrashPage";
import { Notice, PageHeader, useCrumbs } from "./ui";

/** Hər modulun daxilindəki bölmələr (sekmələr). Hələlik yalnız Texnika saytı üçündür. */
const TABS: Record<string, EntityConfig[]> = {
  FAQ: [faqs],
  PAGES: [offerings, clients, testimonials],
  PROJECTS: [projects],
  FLEET: [items, subcategories, categories],
};

export const MODULE_SLUGS: Record<string, string> = { faq: "FAQ", pages: "PAGES", projects: "PROJECTS", fleet: "FLEET", trash: "TRASH" };

const TITLES: Record<string, { title: string; sub: string }> = {
  FAQ: { title: "Suallar", sub: "Saytda göstərilən tez-tez verilən sualların mətnlərini redaktə edin." },
  PAGES: { title: "Səhifə məzmunu", sub: "Saytın əsas səhifələrində göstərilən məzmunları idarə edin." },
  PROJECTS: { title: "Layihələr", sub: "Saytda göstərilən layihələri və qalereyalarını idarə edin." },
  FLEET: { title: "Texnika kataloqu", sub: "Texnikaları, kateqoriyaları və görünürlüyü idarə edin." },
};

/** Texnika saytı modulu: sekmələr (varsa), siyahı və ya redaktə səhifəsi. `entity` və `keyParam` ünvandan gəlir. */
export function ModulePage({ code, slug, entity, keyParam }: { code: string; slug: string; entity?: string; keyParam?: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const moduleCode = MODULE_SLUGS[slug];
  const tabs = moduleCode ? TABS[moduleCode] : undefined;
  const current = tabs ? (tabs.find((t) => t.id === entity) ?? tabs[0]) : undefined;
  const label = moduleCode ? (TITLES[moduleCode]?.title ?? MODULE_LABELS[moduleCode]) : "";
  useCrumbs(keyParam ? [] : [{ label: site?.name ?? code }, { label: label || "Bölmə" }, ...(current && tabs && tabs.length > 1 ? [{ label: current.tab }] : [])]);

  if (!site || !moduleCode || code !== "equipment" || !can(moduleCode, "VIEW", code)) {
    return (
      <>
        <PageHeader title="Bölmə tapılmadı" sub="Bu bölmə mövcud deyil, bu sayt üçün hələ qoşulmayıb və ya giriş icazəniz yoxdur." />
        <Link href={`/sites/${code}`} className={`${styles.btn} ${styles.btnGhost}`}>
          Geri
        </Link>
      </>
    );
  }

  if (moduleCode === "TRASH") return <TrashPanel site={code} />;
  if (!tabs || !current) return <Notice tone="bad">Bölmə tapılmadı.</Notice>;

  const moduleBase = `/sites/${code}/m/${slug}`;
  const listHref = `${moduleBase}/${current.id}`;

  if (keyParam) return <EntityEditor cfg={current} site={code} siteName={site.name} moduleLabel={label} listHref={listHref} keyParam={keyParam} />;

  const info = TITLES[moduleCode];
  return (
    <>
      <PageHeader
        title={info.title}
        sub={info.sub}
        actions={
          can(current.module, "CREATE", code) && (
            <Link href={`${listHref}/new`} className={`${styles.btn} ${styles.btnGold}`}>
              <Plus size={18} /> {current.newLabel}
            </Link>
          )
        }
      />
      {tabs.length > 1 && (
        <div className={styles.tabs} role="tablist">
          {tabs.map((t) => (
            <Link key={t.id} href={`${moduleBase}/${t.id}`} role="tab" aria-selected={t.id === current.id} className={styles.tab}>
              {t.tab}
            </Link>
          ))}
        </div>
      )}
      <EntityList key={current.id} cfg={current} site={code} base={listHref} />
    </>
  );
}
