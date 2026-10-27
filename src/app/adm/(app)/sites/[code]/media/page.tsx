import type { Metadata } from "next";
import { MediaPage } from "@/components/admin/MediaLibrary";

export const metadata: Metadata = { title: "Media" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <MediaPage code={(await params).code} />;
}
