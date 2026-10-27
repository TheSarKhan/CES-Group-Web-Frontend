import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "CES Admin", template: "%s | CES Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
