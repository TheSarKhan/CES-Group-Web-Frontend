"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeftRight, Bell, Building2, ChartColumn, ChevronDown, CircleHelp, FileText, Folder, HardHat, Home, Image as ImageIcon, LogOut, MessageSquare, Ruler, Settings, Shield, Sprout, Trash2, Truck, User, Users, FileClock } from "lucide-react";
import { useApi } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Avatar } from "./ui";

type Item = { id: string; href: string; label: string; icon: ReactNode; badge?: number };

const LAST_SITE = "ces_admin_site";
const SIZE = 20;
/** Texnika (Equipment) öz kataloq ekranlarını işlədir; digər saytların məzmunu ümumi məzmun mühərrikindən gəlir */
const EQUIPMENT_MODULES: { module: string; slug: string; label: string; icon: ReactNode }[] = [
  { module: "FLEET", slug: "fleet", label: "Texnika kataloqu", icon: <Truck size={SIZE} /> },
  { module: "PROJECTS", slug: "projects", label: "Layihələr", icon: <Folder size={SIZE} /> },
  { module: "PAGES", slug: "pages", label: "Səhifə məzmunu", icon: <FileText size={SIZE} /> },
  { module: "FAQ", slug: "faq", label: "Suallar", icon: <CircleHelp size={SIZE} /> },
];

export const siteIcon = (code: string, size = SIZE) =>
  code === "equipment" ? <Truck size={size} /> : code === "architect" ? <Ruler size={size} /> : code === "construction" ? <HardHat size={size} /> : code === "agro" ? <Sprout size={size} /> : <Building2 size={size} />;

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

/** Seçilmiş sayt (ünvandan, yoxdursa son seçilən, yoxdursa ilk) */
export function useCurrentSite() {
  const { me } = useAdmin();
  const pathname = usePathname();
  const fromPath = /^\/sites\/([^/]+)/.exec(pathname)?.[1];
  const stored = useSyncExternalStore(subscribeLast, readLast, () => null);
  const code = me.sites.find((s) => s.code === fromPath)?.code ?? me.sites.find((s) => s.code === stored)?.code ?? me.sites[0]?.code;
  useEffect(() => {
    if (!fromPath || !me.sites.some((s) => s.code === fromPath)) return;
    try {
      localStorage.setItem(LAST_SITE, fromPath);
      window.dispatchEvent(new Event(LAST_SITE));
    } catch {
      /* brauzer saxlamağa icazə vermir: seçim yalnız bu sessiya üçündür */
    }
  }, [fromPath, me.sites]);
  return me.sites.find((s) => s.code === code);
}

/** Bütün panel boyu görünən yan menyu: sayt seçici, ümumi icmal, saytın modulları, sistem bölmələri */
export function Sidebar({ open, onNavigate, onLogout }: { open: boolean; onNavigate: () => void; onLogout: () => void }) {
  const { me, user, can, canAnywhere } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const summary = useApi<Record<string, number>>("panel/summary").data;
  const counts = useMemo(() => summary ?? {}, [summary]);
  const [menuOpen, setMenuOpen] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const site = useCurrentSite();
  const code = site?.code;

  const onSystemPage = ["/users", "/roles", "/audit", "/profile"].some((p) => pathname.startsWith(p));
  const [sysOpen, setSysOpen] = useState<boolean | null>(null);
  const systemShown = sysOpen ?? onSystemPage;

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

  /** Seçilmiş saytın modulları (yalnız icazəsi olanlar), iki qrupda */
  const groups = useMemo(() => {
    if (!code) return { work: [] as Item[], admin: [] as Item[] };
    const b = `/sites/${code}`;
    const work: (Item & { show: boolean })[] = [
      { id: "stats", href: `${b}/stats`, label: "Statistika", icon: <ChartColumn size={SIZE} />, show: can("STATISTICS", "VIEW", code) },
      { id: "submissions", href: `${b}/submissions`, label: "Müraciətlər", icon: <MessageSquare size={SIZE} />, badge: counts[code], show: can("SUBMISSIONS", "VIEW", code) },
      ...(code === "equipment"
        ? EQUIPMENT_MODULES.map((m) => ({ id: m.slug, href: `${b}/m/${m.slug}`, label: m.label, icon: m.icon, show: can(m.module, "VIEW", code) }))
        : [{ id: "content", href: `${b}/content`, label: "Məzmun", icon: <FileText size={SIZE} />, show: can("FAQ", "VIEW", code) || can("PAGES", "VIEW", code) || can("PROJECTS", "VIEW", code) }]),
      { id: "media", href: `${b}/media`, label: "Media", icon: <ImageIcon size={SIZE} />, show: can("MEDIA", "VIEW", code) },
    ];
    const admin: (Item & { show: boolean })[] = [
      { id: "redirects", href: `${b}/redirects`, label: "Yönləndirmələr", icon: <ArrowLeftRight size={SIZE} />, show: can("REDIRECTS", "VIEW", code) },
      { id: "notifications", href: `${b}/notifications`, label: "Bildirişlər", icon: <Bell size={SIZE} />, show: can("NOTIFICATIONS", "VIEW", code) },
      ...(code === "equipment" ? [{ id: "trash", href: `${b}/m/trash`, label: "Zibil qutusu", icon: <Trash2 size={SIZE} />, show: can("TRASH", "VIEW", code) }] : []),
    ];
    return { work: work.filter((i) => i.show), admin: admin.filter((i) => i.show) };
  }, [code, can, counts]);

  const system = [
    { href: "/users", label: "İstifadəçilər", icon: <Users size={18} />, show: can("USERS", "VIEW") },
    { href: "/roles", label: "Rollar", icon: <Shield size={18} />, show: can("ROLES", "VIEW") },
    { href: "/audit", label: "Audit log", icon: <FileClock size={18} />, show: can("AUDIT", "VIEW") },
    { href: "/profile", label: "Profil və 2FA", icon: <User size={18} />, show: true },
  ].filter((l) => l.show);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  /** Sayt dəyişəndə eyni bölməyə (varsa) keçir, yoxdursa saytın ilk moduluna */
  function switchSite(next: string) {
    setMenuOpen(false);
    const section = /^\/sites\/[^/]+\/([^/]+)/.exec(pathname)?.[1];
    const keep = ["stats", "submissions", "content", "media", "redirects", "notifications"].includes(section ?? "") ? section : "stats";
    const allowed: Record<string, boolean> = {
      stats: can("STATISTICS", "VIEW", next),
      submissions: can("SUBMISSIONS", "VIEW", next),
      content: next !== "equipment" && (can("FAQ", "VIEW", next) || can("PAGES", "VIEW", next) || can("PROJECTS", "VIEW", next)),
      media: can("MEDIA", "VIEW", next),
      redirects: can("REDIRECTS", "VIEW", next),
      notifications: can("NOTIFICATIONS", "VIEW", next),
    };
    router.push(allowed[keep as string] ? `/sites/${next}/${keep}` : `/sites/${next}`);
    onNavigate();
  }

  const link = (i: Item) => (
    <Link key={i.id} href={i.href} className={styles.sideLink} aria-current={active(i.href) ? "page" : undefined} onClick={onNavigate}>
      {i.icon}
      {i.label}
      {i.badge ? <span className={styles.sideBadge}>{i.badge}</span> : null}
    </Link>
  );

  return (
    <aside className={`${styles.side} ${open ? styles.sideOpen : ""}`} aria-label="Yan menyu">
      <Link href="/" className={styles.sideBrand} onClick={onNavigate}>
        <span className={styles.logoMark}>CES</span>
        CES Admin
      </Link>

      {site && (
        <div className={styles.sidePicker} ref={picker}>
          <button type="button" className={styles.sideSite} aria-haspopup="listbox" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            {siteIcon(site.code, 22)}
            <span className={styles.sideSiteText}>
              <strong>{site.name}</strong>
              <em>{site.domain}</em>
            </span>
            <ChevronDown size={18} className={`${styles.sideChev} ${menuOpen ? styles.sideChevOpen : ""}`} />
          </button>
          {menuOpen && (
            <ul className={styles.sideMenu} role="listbox" aria-label="Sayt seçimi">
              <li className={styles.sideMenuHead}>
                Sayt seçin
                <span>İdarə etmək istədiyiniz saytı seçin.</span>
              </li>
              {me.sites.map((s) => (
                <li key={s.code} role="option" aria-selected={s.code === code}>
                  <button type="button" onClick={() => switchSite(s.code)}>
                    {siteIcon(s.code, 22)}
                    <span>
                      <strong>{s.name}</strong>
                      <em>{s.domain}</em>
                    </span>
                    {counts[s.code] ? <span className={styles.sideBadge}>{counts[s.code]}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <nav className={styles.sideGroup} aria-label="Ümumi">
        {canAnywhere("STATISTICS", "VIEW") && (
          <Link href="/" className={styles.sideLink} aria-current={pathname === "/" || pathname === "/stats" ? "page" : undefined} onClick={onNavigate}>
            <Home size={SIZE} />
            Ümumi icmal
          </Link>
        )}
      </nav>

      {site && groups.work.length > 0 && (
        <nav className={styles.sideGroup} aria-label={`${site.name} iş sahəsi`}>
          <span className={styles.sideLabel}>İş sahəsi</span>
          {groups.work.map(link)}
        </nav>
      )}
      {site && groups.admin.length > 0 && (
        <nav className={styles.sideGroup} aria-label={`${site.name} idarəetmə`}>
          <span className={styles.sideLabel}>İdarəetmə</span>
          {groups.admin.map(link)}
        </nav>
      )}
      {site && groups.work.length + groups.admin.length === 0 && <p className={styles.sideLabel}>Bu sayt üçün modul icazəniz yoxdur.</p>}

      <div className={styles.sideSpacer} />

      <nav className={styles.sideGroup} aria-label="Sistem">
        <button type="button" className={`${styles.sideLink} ${styles.sideToggle}`} aria-expanded={systemShown} onClick={() => setSysOpen(!systemShown)}>
          <Settings size={SIZE} />
          Sistem
          <ChevronDown size={18} className={`${styles.sideChev} ${systemShown ? styles.sideChevOpen : ""}`} />
        </button>
        {systemShown && (
          <div className={styles.sideSub}>
            {system.map((l) => (
              <Link key={l.href} href={l.href} className={styles.sideLink} aria-current={active(l.href) ? "page" : undefined} onClick={onNavigate}>
                {l.icon}
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className={styles.sideUser}>
        <Avatar name={user.name} />
        <div className={styles.sideUserText} title={user.email}>
          <strong>{user.name}</strong>
          <span>{user.superAdmin ? "Super Admin" : user.email}</span>
        </div>
        <button type="button" className={styles.sideOut} onClick={onLogout} aria-label="Çıxış" title="Çıxış">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
