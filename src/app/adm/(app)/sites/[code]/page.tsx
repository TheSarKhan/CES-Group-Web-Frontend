import type { Metadata } from "next";
import { SiteHome } from "@/components/admin/SiteHome";

export const metadata: Metadata = { title: "Sayt" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <SiteHome code={code} />;
}
