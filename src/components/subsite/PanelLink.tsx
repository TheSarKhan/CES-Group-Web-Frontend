import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./PanelLink.module.css";

type Props = {
  href: string;
  image: string;
  alt: string;
  /** "Xidmət" / "Layihə" — başlığın sol-yuxarısında kiçik yazı */
  kind: string;
  title: string;
  index?: number;
  sizes: string;
  priority?: boolean;
  meta?: string;
  onEnter?: () => void;
  onLeave?: () => void;
  /** Şəklin üstündə, kölgənin altında göstərilən əlavə qat (məs. panorama) */
  underlay?: ReactNode;
};

/** Xidmət və layihə siyahılarında istifadə olunan şəkilli kart. */
export function PanelLink({ href, image, alt, kind, title, index, sizes, priority, meta, onEnter, onLeave, underlay }: Props) {
  return (
    <Link href={href} className={styles.card} data-header-theme="dark" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Image src={image} alt={alt} fill sizes={sizes} quality={70} priority={priority} className={styles.img} />
      {underlay}
      <span className={styles.shade} aria-hidden="true" />
      {index !== undefined && <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>}
      <span className={styles.center}>
        <span className={styles.inner}>
          <span className={styles.kind}>{kind}</span>
          <span className={styles.title}>{title}</span>
          <span className={styles.line} aria-hidden="true" />
          {meta && <span className={styles.meta}>{meta}</span>}
        </span>
      </span>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}
