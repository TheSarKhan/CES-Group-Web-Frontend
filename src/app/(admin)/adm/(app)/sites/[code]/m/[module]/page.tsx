import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/ModulePage";

export const metadata: Metadata = { title: "Məzmun" };

export default async function Page({ params }: { params: Promise<{ code: string; module: string }> }) {
  const { code, module } = await params;
  return <ModulePage code={code} slug={module} />;
}
