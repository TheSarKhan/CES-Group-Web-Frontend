import type { Metadata } from "next";
import { ContentHub } from "@/components/admin/ContentPages";

export const metadata: Metadata = { title: "Məzmun" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <ContentHub code={(await params).code} />;
}
