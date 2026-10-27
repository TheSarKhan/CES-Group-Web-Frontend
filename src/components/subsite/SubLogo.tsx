import Link from "next/link";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import styles from "../Logo.module.css";

/** Müvəqqəti işarə — rəsmi loqo gələndə burada əvəz olunacaq. Ad "CES Construction" kimi iki hissəyə bölünür. */
export function SubLogo({ name, tone = "light", lang = "az" }: { name: string; tone?: "light" | "dark"; lang?: Lang }) {
  const [first, ...rest] = name.split(" ");
  return (
    <Link href={localePath(lang, "/")} className={`${styles.logo} ${tone === "dark" ? styles.dark : ""}`} aria-label={getUi(lang).sub.logoAria(name)}>
      <span className={styles.mark} aria-hidden="true">
        <span />
      </span>
      <span className={styles.ces}>{first}</span>
      {rest.length > 0 && <span className={styles.group}>{rest.join(" ")}</span>}
    </Link>
  );
}
