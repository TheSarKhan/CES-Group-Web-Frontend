import type { EntityConfig, Row } from "./EntityManager";
import { azText } from "./EntityManager";
import styles from "./admin.module.css";
import { previewUrl } from "@/lib/admin/upload";

const status = (r: Row) => (
  <span className={`${styles.badge} ${r.isPublished === false ? styles.badgeBad : styles.badgeOk}`}>{r.isPublished === false ? "Gizli" : "Saytda"}</span>
);
const thumb = (url: unknown) =>
  typeof url === "string" && url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={previewUrl(url)} alt="" style={{ width: 56, height: 40, objectFit: "contain", background: "var(--paper)", borderRadius: 4 }} />
  ) : (
    <span className={styles.muted}>—</span>
  );
const sort = { head: "Sıra", cell: (r: Row) => String(r.sortOrder ?? "") };
const published = { kind: "bool" as const, name: "isPublished", label: "Saytda görünsün" };
const sortField = { kind: "number" as const, name: "sortOrder", label: "Sıra", hint: "Kiçik rəqəm əvvəldə göstərilir." };
const nameAz = (r: Row) => azText(r, "name") || String(r.slug ?? "");

export const faqs: EntityConfig = {
  id: "faqs",
  title: "Sual-cavab",
  sub: "Saytdakı tez-tez verilən suallar.",
  module: "FAQ",
  path: "admin/faqs",
  key: "id",
  newLabel: "+ Yeni sual",
  columns: [{ head: "Sual (AZ)", cell: (r) => azText(r, "question") }, sort, { head: "Status", cell: status }],
  fields: [sortField, published],
  tr: [
    { name: "question", label: "Sual", required: true, max: 512 },
    { name: "answer", label: "Cavab", kind: "textarea", required: true, max: 4096, rows: 6 },
  ],
  confirmName: (r) => azText(r, "question"),
};

export const offerings: EntityConfig = {
  id: "offerings",
  title: "Xidmətlər",
  sub: "Ana səhifədəki xidmət kartları.",
  module: "PAGES",
  path: "admin/offerings",
  key: "slug",
  newLabel: "+ Yeni xidmət",
  columns: [{ head: "", cell: (r) => thumb(r.icon) }, { head: "Başlıq (AZ)", cell: (r) => azText(r, "title") }, sort, { head: "Status", cell: status }],
  fields: [{ kind: "image", name: "icon", label: "Şəkil / ikon", folder: "offerings" }, sortField, published],
  tr: [
    { name: "eyebrow", label: "Üst yazı", max: 64 },
    { name: "title", label: "Başlıq", required: true, max: 256 },
    { name: "description", label: "Təsvir", kind: "textarea", max: 1024 },
  ],
  confirmName: (r) => azText(r, "title"),
};

export const clients: EntityConfig = {
  id: "clients",
  title: "Müştərilər",
  sub: "Saytdakı müştəri loqoları.",
  module: "PAGES",
  path: "admin/clients",
  key: "id",
  newLabel: "+ Yeni müştəri",
  columns: [{ head: "Loqo", cell: (r) => thumb(r.logo) }, { head: "Ad", cell: (r) => String(r.name ?? "") }, sort, { head: "Status", cell: status }],
  fields: [
    { kind: "text", name: "name", label: "Ad", required: true, max: 128 },
    { kind: "image", name: "logo", label: "Loqo", folder: "clients", required: true },
    { kind: "text", name: "url", label: "Sayt ünvanı (könüllü)", max: 512 },
    sortField,
    published,
  ],
  confirmName: (r) => String(r.name ?? ""),
};

export const testimonials: EntityConfig = {
  id: "testimonials",
  title: "Rəylər",
  sub: "Müştəri rəyləri.",
  module: "PAGES",
  path: "admin/testimonials",
  key: "id",
  newLabel: "+ Yeni rəy",
  columns: [{ head: "Ad", cell: (r) => String(r.name ?? "") }, { head: "Şirkət", cell: (r) => String(r.company ?? "") }, sort, { head: "Status", cell: status }],
  fields: [
    { kind: "text", name: "name", label: "Ad", required: true, max: 128 },
    { kind: "text", name: "initials", label: "Baş hərflər", max: 8 },
    { kind: "text", name: "company", label: "Şirkət", max: 128 },
    { kind: "image", name: "avatar", label: "Şəkil", folder: "testimonials" },
    sortField,
    published,
  ],
  tr: [
    { name: "role", label: "Vəzifə", max: 256 },
    { name: "quote", label: "Rəy", kind: "textarea", required: true, max: 2048, rows: 5 },
  ],
  confirmName: (r) => String(r.name ?? ""),
};

export const projects: EntityConfig = {
  id: "projects",
  title: "Layihələr",
  sub: "Saytdakı layihələr.",
  module: "PROJECTS",
  path: "admin/projects",
  key: "slug",
  newLabel: "+ Yeni layihə",
  columns: [{ head: "", cell: (r) => thumb(r.image) }, { head: "Ad (AZ)", cell: (r) => azText(r, "title") }, { head: "İl", cell: (r) => String(r.year ?? "") }, sort, { head: "Status", cell: status }],
  fields: [
    { kind: "text", name: "year", label: "İl", max: 16, placeholder: "2025" },
    { kind: "image", name: "image", label: "Əsas şəkil", folder: "projects" },
    { kind: "gallery", name: "gallery", label: "Qalereya", folder: "projects" },
    sortField,
    published,
  ],
  tr: [
    { name: "title", label: "Ad", required: true, max: 256 },
    { name: "category", label: "Kateqoriya", max: 128 },
    { name: "meta", label: "Qısa məlumat", max: 256 },
    { name: "description", label: "Təsvir", kind: "textarea", max: 4096, rows: 6 },
  ],
  confirmName: (r) => azText(r, "title"),
};

export const categories: EntityConfig = {
  id: "categories",
  title: "Kateqoriyalar",
  sub: "Texnika kataloqunun əsas bölmələri.",
  module: "FLEET",
  path: "admin/fleet/categories",
  key: "slug",
  newLabel: "+ Yeni kateqoriya",
  columns: [{ head: "Ad (AZ)", cell: (r) => nameAz(r) }, { head: "Alt kateqoriya", cell: (r) => String((r.subcategories as unknown[] | undefined)?.length ?? 0) }, sort, { head: "Status", cell: status }],
  fields: [{ kind: "text", name: "icon", label: "İkon adı (könüllü)", max: 64 }, sortField, published],
  tr: [{ name: "name", label: "Ad", required: true, max: 128 }],
  confirmName: nameAz,
};

export const subcategories: EntityConfig = {
  id: "subcategories",
  title: "Alt kateqoriyalar",
  sub: "Kateqoriyanın daxilindəki növlər (məs. Avtokran, Forklift).",
  module: "FLEET",
  path: "admin/fleet/subcategories",
  key: "slug",
  newLabel: "+ Yeni alt kateqoriya",
  deps: { cats: "admin/fleet/categories" },
  columns: [
    { head: "Ad (AZ)", cell: (r) => nameAz(r) },
    { head: "Kateqoriya", cell: (r) => azText(r.category as Row, "name") },
    { head: "Texnika", cell: (r) => String((r.items as unknown[] | undefined)?.length ?? 0) },
    sort,
    { head: "Status", cell: status },
  ],
  fields: [
    { kind: "select", name: "categorySlug", label: "Kateqoriya", required: true, options: (d) => (d.cats ?? []).map((c) => ({ value: String(c.slug), label: nameAz(c) })) },
    sortField,
    published,
  ],
  tr: [{ name: "name", label: "Ad", required: true, max: 128 }],
  fromRow: (r) => ({ categorySlug: String((r.category as Row | undefined)?.slug ?? "") }),
  confirmName: nameAz,
};

export const items: EntityConfig = {
  id: "items",
  title: "Texnikalar",
  sub: "Kataloqdakı texnika vahidləri.",
  module: "FLEET",
  path: "admin/fleet/items",
  key: "slug",
  newLabel: "+ Yeni texnika",
  detail: true,
  specs: true,
  deps: { subs: "admin/fleet/subcategories" },
  columns: [
    { head: "", cell: (r) => thumb(r.image) },
    { head: "Ad (AZ)", cell: (r) => nameAz(r) },
    { head: "Model", cell: (r) => String(r.modelNumber ?? "") },
    { head: "Növ", cell: (r) => String(r.subcategoryName ?? "") },
    sort,
    { head: "Status", cell: status },
  ],
  fields: [
    { kind: "select", name: "subcategorySlug", label: "Alt kateqoriya", required: true, options: (d) => (d.subs ?? []).map((s) => ({ value: String(s.slug), label: `${nameAz(s)} (${azText(s.category as Row, "name")})` })) },
    { kind: "text", name: "modelNumber", label: "Model", max: 128 },
    { kind: "image", name: "image", label: "Şəkil", folder: "fleet" },
    { kind: "text", name: "price", label: "Qiymət (könüllü)", max: 64, hint: "Boş qalsa sayt “sorğu ilə” göstərir." },
    { kind: "text", name: "priceUnit", label: "Qiymət vahidi", max: 32, placeholder: "gün" },
    sortField,
    published,
  ],
  tr: [
    { name: "name", label: "Ad", required: true, max: 256 },
    { name: "description", label: "Təsvir", kind: "textarea", max: 4096, rows: 6 },
    { name: "badge", label: "Nişan (məs. Yeni)", max: 64 },
  ],
  fromRow: (r) => ({ subcategorySlug: String((r.subcategory as Row | undefined)?.slug ?? r.subcategorySlug ?? "") }),
  searchText: (r) => `${nameAz(r)} ${r.modelNumber ?? ""} ${r.subcategoryName ?? ""} ${r.slug ?? ""}`,
  confirmName: nameAz,
};
