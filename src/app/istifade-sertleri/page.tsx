import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { terms } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";

const path = "/istifade-sertleri";

export const metadata: Metadata = pageMetadata({ title: terms.title, description: terms.description, path });

export default function Page() {
  return <LegalPage doc={terms} path={path} />;
}
