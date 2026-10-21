import Link from "next/link";
import styles from "../Logo.module.css";

/** Müvəqqəti işarə — rəsmi loqo gələndə burada əvəz olunacaq. Ad "CES Construction" kimi iki hissəyə bölünür. */
export function SubLogo({ name, tone = "light" }: { name: string; tone?: "light" | "dark" }) {
  const [first, ...rest] = name.split(" ");
  return (
    <Link href="/" className={`${styles.logo} ${tone === "dark" ? styles.dark : ""}`} aria-label={`${name}, ana səhifə`}>
      <span className={styles.mark} aria-hidden="true">
        <span />
      </span>
      <span className={styles.ces}>{first}</span>
      {rest.length > 0 && <span className={styles.group}>{rest.join(" ")}</span>}
    </Link>
  );
}
