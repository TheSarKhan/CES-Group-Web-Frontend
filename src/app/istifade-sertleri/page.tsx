import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegal } from "@/content/loaders";
import { pageMetadata } from "@/lib/seo";

const path = "/istifade-sertleri";

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir; src/lib/cms.ts-dəki CMS_REVALIDATE ilə eyni olmalıdır) */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getLegal("istifade-sertleri");
  return pageMetadata({ title: doc.title, description: doc.description, path });
}

export default async function Page() {
  return <LegalPage doc={await getLegal("istifade-sertleri")} path={path} />;
}
