import Link from "next/link";
import styles from "./Logo.module.css";

/** Müvəqqəti işarə — qrupun rəsmi loqosu gələndə burada əvəz olunacaq. */
export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link href="/" className={`${styles.logo} ${tone === "dark" ? styles.dark : ""}`} aria-label="CES Group, ana səhifə">
      <span className={styles.mark} aria-hidden="true">
        <span />
      </span>
      <span className={styles.ces}>CES</span>
      <span className={styles.group}>Group</span>
    </Link>
  );
}
