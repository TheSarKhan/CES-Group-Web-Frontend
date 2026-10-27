import { AdminApp } from "@/components/admin/AdminApp";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AdminApp>{children}</AdminApp>;
}
