import Link from "next/link";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import styles from "./Logo.module.css";

/** Müvəqqəti işarə — qrupun rəsmi loqosu gələndə burada əvəz olunacaq. */
export function Logo({ tone = "light", lang = "az" }: { tone?: "light" | "dark"; lang?: Lang }) {
  return (
    <Link href={localePath(lang, "/")} className={`${styles.logo} ${tone === "dark" ? styles.dark : ""}`} aria-label={getUi(lang).logoAria}>
      <span className={styles.mark} aria-hidden="true">
        <span />
      </span>
      <span className={styles.ces}>CES</span>
      <span className={styles.group}>Group</span>
    </Link>
  );
}
