import type { Metadata } from "next";
import { StatsOverviewPage } from "@/components/admin/StatsOverviewPage";

export const metadata: Metadata = { title: "Statistika" };

export default function Page() {
  return <StatsOverviewPage />;
}
