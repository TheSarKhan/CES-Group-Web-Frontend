"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { api, useApi } from "@/lib/admin/client";
import type { Action, Me, UserInfo } from "@/lib/admin/types";
import styles from "./admin.module.css";

type Ctx = {
  me: Me;
  user: UserInfo;
  reloadUser: () => void;
  can: (module: string, action: Action, site?: string) => boolean;
  /** Sayt üzrə modulda istənilən saytda icazə varmı */
  canAnywhere: (module: string, action: Action) => boolean;
};
const AdminContext = createContext<Ctx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin outside AdminApp");
  return ctx;
}

/** Giriş edilib-edilmədiyini yoxlayır, istifadəçinin icazələrini yükləyir və ümumi çərçivəni göstərir */
export function AdminApp({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const meReq = useApi<Me>("iam/me");
  const userReq = useApi<UserInfo>("auth/me");

  const can = useCallback(
    (module: string, action: Action, site?: string) => {
      const me = meReq.data;
      if (!me) return false;
      if (me.superAdmin) return true;
      if (site) return me.sites.find((s) => s.code === site)?.modules[module]?.includes(action) ?? false;
      return me.global[module]?.includes(action) ?? false;
    },
    [meReq.data],
  );

  const canAnywhere = useCallback(
    (module: string, action: Action) => {
      const me = meReq.data;
      if (!me) return false;
      return me.superAdmin || me.sites.some((s) => s.modules[module]?.includes(action));
    },
    [meReq.data],
  );

  if (meReq.error || userReq.error) return <main className={styles.main}><p className={styles.error}>{meReq.error ?? userReq.error}</p></main>;
  if (!meReq.data || !userReq.data) return <p className={styles.loading} style={{ textAlign: "center" }}>Yüklənir…</p>;

  const me = meReq.data;
  const user = userReq.data;
  const links = [
    { href: "/", label: "Saytlar", show: true },
    { href: "/stats", label: "Statistika", show: canAnywhere("STATISTICS", "VIEW") },
    { href: "/users", label: "İstifadəçilər", show: can("USERS", "VIEW") },
    { href: "/roles", label: "Rollar", show: can("ROLES", "VIEW") },
    { href: "/audit", label: "Audit log", show: can("AUDIT", "VIEW") },
  ].filter((l) => l.show);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    window.location.replace("/login");
  }

  return (
    <AdminContext.Provider value={{ me, user, reloadUser: userReq.reload, can, canAnywhere }}>
      <div className={styles.shell}>
        {user.mfaSetupRequired && (
          <div className={styles.banner}>
            Super Admin hesabı üçün iki mərhələli giriş (2FA) tövsiyə olunur. <Link href="/profile">İndi aktiv et</Link>
          </div>
        )}
        <header className={styles.bar}>
          <div className={styles.barInner}>
            <Link href="/" className={styles.brand}>
              CES <span>Admin</span>
            </Link>
            <nav className={styles.nav} aria-label="Əsas menyu">
              {links.map((l) => (
                <Link key={l.href} href={l.href} aria-current={(l.href === "/" ? pathname === "/" || pathname.startsWith("/sites") : pathname.startsWith(l.href)) ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className={styles.userbox}>
              <Link href="/profile">{user.name}</Link>
              <button className={styles.linkBtn} onClick={logout}>
                Çıxış
              </button>
            </div>
          </div>
        </header>
        <main id="main" className={styles.main}>
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  );
}

export { api };
