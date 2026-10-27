import type { Metadata } from "next";
import { StatsPage } from "@/components/admin/StatsPage";

export const metadata: Metadata = { title: "Statistika" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <StatsPage code={(await params).code} />;
}
