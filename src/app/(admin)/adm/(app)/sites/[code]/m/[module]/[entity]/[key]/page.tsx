import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/ModulePage";

export const metadata: Metadata = { title: "Redaktə" };

export default async function Page({ params }: { params: Promise<{ code: string; module: string; entity: string; key: string }> }) {
  const { code, module, entity, key } = await params;
  return <ModulePage code={code} slug={module} entity={entity} keyParam={decodeURIComponent(key)} />;
}
