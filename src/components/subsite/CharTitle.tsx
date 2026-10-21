import styles from "./Anim.module.css";

/** Başlıq hərf-hərf açılır. Ekran oxuyucular üçün tam mətn aria-label-də qalır. */
export function CharTitle({ text, delay = 0, step = 45, as: Tag = "h1", className }: { text: string; delay?: number; step?: number; as?: "h1" | "h2"; className?: string }) {
  return (
    <Tag aria-label={text} className={className}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden="true" className={styles.char} style={{ animationDelay: `${delay + Math.min(i, 14) * step}ms` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </Tag>
  );
}
