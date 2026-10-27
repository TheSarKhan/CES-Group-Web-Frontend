"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { api, useApi } from "@/lib/admin/client";
import type { Action, Me, UserInfo } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { Sidebar } from "./Sidebar";

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
  // Mobil menyu hansı səhifədə açılıbsa, yalnız orada açıq sayılır: səhifə dəyişəndə özü bağlanır
  const [navFor, setNavFor] = useState<string | null>(null);
  const navOpen = navFor === pathname;
  const setNavOpen = (v: boolean | ((o: boolean) => boolean)) => setNavFor((cur) => ((typeof v === "function" ? v(cur === pathname) : v) ? pathname : null));
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
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    window.location.replace("/login");
  }

  return (
    <AdminContext.Provider value={{ me, user, reloadUser: userReq.reload, can, canAnywhere }}>
      <div className={styles.shell}>
        <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} onLogout={logout} />
        {navOpen && <button type="button" className={styles.scrim} aria-label="Menyunu bağla" onClick={() => setNavOpen(false)} />}
        <div className={styles.content}>
          <header className={styles.topbar}>
            <button type="button" className={styles.burger} aria-label="Menyunu aç" aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}>
              ☰
            </button>
            <Link href="/" className={styles.topbarBrand}>
              CES <span>Admin</span>
            </Link>
          </header>
          {user.mfaSetupRequired && (
            <div className={styles.banner}>
              Super Admin hesabı üçün iki mərhələli giriş (2FA) tövsiyə olunur. <Link href="/profile">İndi aktiv et</Link>
            </div>
          )}
          <main id="main" className={styles.main}>
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}

export { api };
