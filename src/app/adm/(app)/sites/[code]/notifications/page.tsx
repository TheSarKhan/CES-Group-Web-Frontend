import type { Metadata } from "next";
import { NotificationsPage } from "@/components/admin/NotificationsPage";

export const metadata: Metadata = { title: "Bildirişlər" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <NotificationsPage code={(await params).code} />;
}
