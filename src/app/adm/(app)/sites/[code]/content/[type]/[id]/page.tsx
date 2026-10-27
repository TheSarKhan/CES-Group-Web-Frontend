import type { Metadata } from "next";
import { ContentEditor } from "@/components/admin/ContentPages";

export const metadata: Metadata = { title: "Redaktə" };

export default async function Page({ params }: { params: Promise<{ code: string; type: string; id: string }> }) {
  const { code, type, id } = await params;
  return <ContentEditor code={code} type={type} id={id} />;
}
