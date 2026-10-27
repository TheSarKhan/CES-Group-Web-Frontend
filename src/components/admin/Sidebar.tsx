"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useApi } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";

type Item = { id: string; href: string; label: string; badge?: number };

const LAST_SITE = "ces_admin_site";
/** Texnika (Equipment) öz kataloq ekranlarını işlədir; digər saytların məzmunu ümumi məzmun mühərrikindən gəlir */
const EQUIPMENT_MODULES: { module: string; slug: string; label: string }[] = [
  { module: "FLEET", slug: "fleet", label: "Texnika kataloqu" },
  { module: "PROJECTS", slug: "projects", label: "Layihələr" },
  { module: "FAQ", slug: "faq", label: "Suallar" },
  { module: "PAGES", slug: "pages", label: "Səhifə məzmunu" },
  { module: "TRASH", slug: "trash", label: "Zibil qutusu" },
];

const readLast = () => {
  try {
    return localStorage.getItem(LAST_SITE);
  } catch {
    return null;
  }
};
const subscribeLast = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(LAST_SITE, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(LAST_SITE, cb);
  };
};

/** Bütün panel boyu görünən yan menyu: ümumi icmal, sayt seçici + seçilmiş saytın modulları, sistem bölmələri */
export function Sidebar({ open, onNavigate, onLogout }: { open: boolean; onNavigate: () => void; onLogout: () => void }) {
  const { me, user, can, canAnywhere } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const summary = useApi<Record<string, number>>("panel/summary").data;
  const counts = useMemo(() => summary ?? {}, [summary]);
  const [menuOpen, setMenuOpen] = useState(false);
  const picker = useRef<HTMLDivElement>(null);

  const fromPath = /^\/sites\/([^/]+)/.exec(pathname)?.[1];
  const stored = useSyncExternalStore(subscribeLast, readLast, () => null);
  const code = me.sites.find((s) => s.code === fromPath)?.code ?? me.sites.find((s) => s.code === stored)?.code ?? me.sites[0]?.code;
  const site = me.sites.find((s) => s.code === code);

  useEffect(() => {
    if (!fromPath || !me.sites.some((s) => s.code === fromPath)) return;
    try {
      localStorage.setItem(LAST_SITE, fromPath);
      window.dispatchEvent(new Event(LAST_SITE));
    } catch {
      /* brauzer saxlamağa icazə vermir: seçim yalnız bu sessiya üçündür */
    }
  }, [fromPath, me.sites]);

  useEffect(() => {
    if (!menuOpen) return;
    const away = (e: MouseEvent) => !picker.current?.contains(e.target as Node) && setMenuOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [menuOpen]);

  /** Seçilmiş saytın modulları (yalnız icazəsi olanlar) */
  const items = useMemo<Item[]>(() => {
    if (!code) return [];
    const b = `/sites/${code}`;
    const list: (Item & { show: boolean })[] = [
      { id: "stats", href: `${b}/stats`, label: "Statistika", show: can("STATISTICS", "VIEW", code) },
      { id: "submissions", href: `${b}/submissions`, label: "Müraciətlər", badge: counts[code], show: can("SUBMISSIONS", "VIEW", code) },
      ...(code === "equipment"
        ? EQUIPMENT_MODULES.map((m) => ({ id: m.slug, href: `${b}/m/${m.slug}`, label: m.label, show: can(m.module, "VIEW", code) }))
        : [{ id: "content", href: `${b}/content`, label: "Məzmun", show: can("FAQ", "VIEW", code) || can("PAGES", "VIEW", code) || can("PROJECTS", "VIEW", code) }]),
      { id: "media", href: `${b}/media`, label: "Media", show: can("MEDIA", "VIEW", code) },
      { id: "redirects", href: `${b}/redirects`, label: "Yönləndirmələr", show: can("REDIRECTS", "VIEW", code) },
      { id: "notifications", href: `${b}/notifications`, label: "Bildirişlər", show: can("NOTIFICATIONS", "VIEW", code) },
    ];
    return list.filter((i) => i.show);
  }, [code, can, counts]);

  const system = [
    { href: "/users", label: "İstifadəçilər", show: can("USERS", "VIEW") },
    { href: "/roles", label: "Rollar", show: can("ROLES", "VIEW") },
    { href: "/audit", label: "Audit log", show: can("AUDIT", "VIEW") },
    { href: "/profile", label: "Profil və 2FA", show: true },
  ].filter((l) => l.show);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  /** Sayt dəyişəndə eyni bölməyə (varsa) keçir, yoxdursa saytın ilk moduluna */
  function switchSite(next: string) {
    setMenuOpen(false);
    const section = /^\/sites\/[^/]+\/([^/]+)/.exec(pathname)?.[1];
    const keep = ["stats", "submissions", "content", "media", "redirects", "notifications"].includes(section ?? "") ? section : "stats";
    const target = `/sites/${next}/${keep}`;
    const allowed: Record<string, boolean> = {
      stats: can("STATISTICS", "VIEW", next),
      submissions: can("SUBMISSIONS", "VIEW", next),
      content: next !== "equipment" && (can("FAQ", "VIEW", next) || can("PAGES", "VIEW", next) || can("PROJECTS", "VIEW", next)),
      media: can("MEDIA", "VIEW", next),
      redirects: can("REDIRECTS", "VIEW", next),
      notifications: can("NOTIFICATIONS", "VIEW", next),
    };
    router.push(allowed[keep as string] ? target : `/sites/${next}`);
    onNavigate();
  }

  return (
    <aside className={`${styles.side} ${open ? styles.sideOpen : ""}`} aria-label="Yan menyu">
      <Link href="/" className={styles.sideBrand} onClick={onNavigate}>
        CES <span>Admin</span>
      </Link>

      <nav className={styles.sideGroup} aria-label="Ümumi">
        {canAnywhere("STATISTICS", "VIEW") && (
          <Link href="/" className={styles.sideLink} aria-current={pathname === "/" || pathname === "/stats" ? "page" : undefined} onClick={onNavigate}>
            Ümumi icmal
          </Link>
        )}
      </nav>

      {site && (
        <div className={styles.sidePicker} ref={picker}>
          <span className={styles.sideLabel}>Sayt</span>
          <button type="button" className={styles.sideSite} aria-haspopup="listbox" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            <span>
              <strong>{site.name}</strong>
              <em>{site.domain}</em>
            </span>
            <span aria-hidden="true">{menuOpen ? "▴" : "▾"}</span>
          </button>
          {menuOpen && (
            <ul className={styles.sideMenu} role="listbox" aria-label="Sayt seçimi">
              {me.sites.map((s) => (
                <li key={s.code} role="option" aria-selected={s.code === code}>
                  <button type="button" onClick={() => switchSite(s.code)}>
                    <strong>{s.name}</strong>
                    <em>{s.domain}</em>
                    {counts[s.code] ? <span className={styles.sideBadge}>{counts[s.code]}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {site && (
        <nav className={styles.sideGroup} aria-label={`${site.name} bölmələri`}>
          {items.length === 0 && <p className={styles.sideEmpty}>Bu sayt üçün modul icazəniz yoxdur.</p>}
          {items.map((i) => (
            <Link key={i.id} href={i.href} className={styles.sideLink} aria-current={active(i.href) ? "page" : undefined} onClick={onNavigate}>
              {i.label}
              {i.badge ? <span className={styles.sideBadge}>{i.badge}</span> : null}
            </Link>
          ))}
          <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer" className={`${styles.sideLink} ${styles.sideExt}`}>
            Sayta bax ↗
          </a>
        </nav>
      )}

      <div className={styles.sideSpacer} />

      <nav className={styles.sideGroup} aria-label="Sistem">
        <span className={styles.sideLabel}>Sistem</span>
        {system.map((l) => (
          <Link key={l.href} href={l.href} className={styles.sideLink} aria-current={active(l.href) ? "page" : undefined} onClick={onNavigate}>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className={styles.sideUser}>
        <span title={user.email}>{user.name}</span>
        <button type="button" className={styles.sideOut} onClick={onLogout}>
          Çıxış
        </button>
      </div>
    </aside>
  );
}
