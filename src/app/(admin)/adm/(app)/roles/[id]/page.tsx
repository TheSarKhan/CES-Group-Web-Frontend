import type { Metadata } from "next";
import { RoleEditorPage } from "@/components/admin/RolesPage";

export const metadata: Metadata = { title: "Rol" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoleEditorPage id={id} />;
}
