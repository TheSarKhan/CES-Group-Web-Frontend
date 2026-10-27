import type { Metadata } from "next";
import { ContentList } from "@/components/admin/ContentPages";

export const metadata: Metadata = { title: "Məzmun" };

export default async function Page({ params }: { params: Promise<{ code: string; type: string }> }) {
  const { code, type } = await params;
  return <ContentList code={code} type={type} />;
}
