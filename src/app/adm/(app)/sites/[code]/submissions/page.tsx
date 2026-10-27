import type { Metadata } from "next";
import { SubmissionsPage } from "@/components/admin/SubmissionsPage";

export const metadata: Metadata = { title: "Müraciətlər" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <SubmissionsPage code={(await params).code} />;
}
