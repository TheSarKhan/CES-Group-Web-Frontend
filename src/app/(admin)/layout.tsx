import { RootShell } from "@/components/RootShell";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell>{children}</RootShell>;
}
