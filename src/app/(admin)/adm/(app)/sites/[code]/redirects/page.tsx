import type { Metadata } from "next";
import { RedirectsPage } from "@/components/admin/RedirectsPage";

export const metadata: Metadata = { title: "Yönləndirmələr" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <RedirectsPage code={(await params).code} />;
}
