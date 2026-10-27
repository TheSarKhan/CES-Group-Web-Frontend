import { RootShell } from "@/components/RootShell";

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir): panel-dəki məzmun ən geci bu vaxtda saytda görünür */
export const revalidate = 300;

export default function SubRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell>{children}</RootShell>;
}
