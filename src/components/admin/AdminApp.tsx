"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { api, useApi } from "@/lib/admin/client";
import type { Action, Me, UserInfo } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { ShieldAlert } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

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
          <Topbar onMenu={() => setNavOpen((v) => !v)} menuOpen={navOpen} />
          {user.mfaSetupRequired && (
            <div className={styles.mfa}>
              <ShieldAlert size={18} aria-hidden="true" />
              <span>2FA aktiv deyil</span>
              <Link href="/profile">Aktiv et</Link>
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
