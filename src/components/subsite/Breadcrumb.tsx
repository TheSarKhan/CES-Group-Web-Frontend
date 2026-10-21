import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className={`${styles.nav} ${light ? styles.light : ""}`}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={item.label} className={styles.item}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href && !last ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className={last ? styles.current : undefined} aria-current={last ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
