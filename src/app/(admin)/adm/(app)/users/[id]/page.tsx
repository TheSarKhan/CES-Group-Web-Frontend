import type { Metadata } from "next";
import { UserEditorPage } from "@/components/admin/UsersPage";

export const metadata: Metadata = { title: "İstifadəçi" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserEditorPage id={id} />;
}
