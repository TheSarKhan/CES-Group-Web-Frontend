"use client";

import { useAdmin } from "./AdminApp";
import { SitePicker } from "./SitePicker";
import { StatsOverviewPage } from "./StatsOverviewPage";

/** Açılış səhifəsi: statistika icazəsi olana bütün saytların icmalı, olmayana sayt seçimi */
export function HomePage() {
  const { canAnywhere } = useAdmin();
  return canAnywhere("STATISTICS", "VIEW") ? <StatsOverviewPage /> : <SitePicker />;
}
