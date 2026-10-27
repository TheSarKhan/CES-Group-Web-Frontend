import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegal } from "@/content/loaders";
import { pageContext } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo";

const path = "/mexfilik-siyaseti";
const ref = { kind: "legal", slug: "mexfilik-siyaseti" } as const;

type Props = { params: Promise<{ lang: string }> };

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir; src/lib/cms.ts-dəki CMS_REVALIDATE ilə eyni olmalıdır) */
export const revalidate = 300;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, langs } = await pageContext(props.params, ref, path);
  const doc = await getLegal("mexfilik-siyaseti", lang);
  return pageMetadata({ title: doc.title, description: doc.description, path, lang, langs });
}

export default async function Page(props: Props) {
  const { lang, switcher } = await pageContext(props.params, ref, path);
  return <LegalPage doc={await getLegal("mexfilik-siyaseti", lang)} path={path} lang={lang} switcher={switcher} />;
}
