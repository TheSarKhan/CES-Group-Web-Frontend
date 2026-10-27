import type { Metadata } from "next";
import { HomePage } from "@/components/admin/HomePage";

export const metadata: Metadata = { title: "Ümumi icmal" };

export default function Page() {
  return <HomePage />;
}
