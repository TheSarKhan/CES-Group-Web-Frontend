import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { privacy } from "@/content/legal";
import { pageMetadata } from "@/lib/seo";

const path = "/mexfilik-siyaseti";

export const metadata: Metadata = pageMetadata({ title: privacy.title, description: privacy.description, path });

export default function Page() {
  return <LegalPage doc={privacy} path={path} />;
}
