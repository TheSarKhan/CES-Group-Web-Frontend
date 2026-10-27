import type { Metadata } from "next";
import { SitePicker } from "@/components/admin/SitePicker";

export const metadata: Metadata = { title: "Saytlar" };

export default function Page() {
  return <SitePicker />;
}
