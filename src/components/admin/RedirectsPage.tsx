"use client";

import { useMemo } from "react";
import { useAdmin } from "./AdminApp";
import styles from "./admin.module.css";
import { EntityManager, type EntityConfig, type Row } from "./EntityManager";
import { SiteTabs } from "./SiteTabs";

const config = (site: string): EntityConfig => ({
  id: "redirects",
  title: "Yönləndirmələr",
  sub: "Köhnə ünvanı yenisinə yönləndirir. Ünvanı dəyişdikdə Google reytinqi itməsin deyə 301 istifadə edin.",
  module: "REDIRECTS",
  path: `panel/sites/${site}/redirects`,
  key: "id",
  newLabel: "+ Yeni yönləndirmə",
  noStatus: true,
  defaults: { code: "301" },
  columns: [
    { head: "Köhnə ünvan", cell: (r: Row) => <span className={styles.mono}>{String(r.fromPath ?? "")}</span> },
    { head: "Yeni ünvan", cell: (r: Row) => <span className={styles.mono}>{String(r.toUrl ?? "")}</span> },
    { head: "Kod", cell: (r: Row) => String(r.code ?? "") },
    { head: "Qeyd", cell: (r: Row) => String(r.note ?? "") },
  ],
  fields: [
    { kind: "text", name: "fromPath", label: "Köhnə ünvan", required: true, max: 255, placeholder: "/kohne-sehife", hint: "Yalnız yol, “/” ilə başlayır. Sorğu parametri (?) olmamalıdır." },
    { kind: "text", name: "toUrl", label: "Yeni ünvan", required: true, max: 512, placeholder: "/yeni-sehife", hint: "Saytın daxilində “/yeni-sehife” və ya tam ünvan “https://...”." },
    {
      kind: "select",
      name: "code",
      label: "Növ",
      required: true,
      options: () => [
        { value: "301", label: "301, daimi (tövsiyə olunur)" },
        { value: "302", label: "302, müvəqqəti" },
        { value: "307", label: "307, müvəqqəti (metod saxlanır)" },
        { value: "308", label: "308, daimi (metod saxlanır)" },
      ],
    },
    { kind: "text", name: "note", label: "Qeyd (könüllü)", max: 255 },
  ],
  confirmName: (r: Row) => String(r.fromPath ?? ""),
});

export function RedirectsPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const cfg = useMemo(() => config(code), [code]);
  if (!site || !can("REDIRECTS", "VIEW", code)) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;
  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{site.name}</h1>
          <p className={styles.sub}>{site.domain}</p>
        </div>
      </div>
      <SiteTabs code={code} current="redirects" />
      <EntityManager cfg={cfg} site={code} />
    </>
  );
}
