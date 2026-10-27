import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegal } from "@/content/loaders";
import { pageMetadata } from "@/lib/seo";

const path = "/mexfilik-siyaseti";

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir; src/lib/cms.ts-dəki CMS_REVALIDATE ilə eyni olmalıdır) */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegal("mexfilik-siyaseti");
  return pageMetadata({ title: doc.title, description: doc.description, path });
}

export default async function Page() {
  return <LegalPage doc={await getLegal("mexfilik-siyaseti")} path={path} />;
}
