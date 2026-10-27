"use client";

import { useState } from "react";
import type { SubService } from "@/content/subsites";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { PanelLink } from "./PanelLink";
import { Reveal } from "./Reveal";
import styles from "./ServicesGrid.module.css";

/** Masaüstündə panellərin üzərinə gələndə aktiv xidmətin şəkli bütün sıra boyunca panorama kimi açılır. */
export function ServicesGrid({ services, lang = "az" }: { services: SubService[]; lang?: Lang }) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);

  return (
    <div className={styles.row} data-header-theme="dark">
      {services.map((s, i) => (
        <Reveal key={s.slug} delay={i * 100} className={styles.item}>
          <PanelLink
            href={localePath(lang, `/xidmetlerimiz/${s.slug}`)}
            image={s.image}
            alt={s.label}
            kind={getUi(lang).sub.serviceKind}
            title={s.label}
            index={i}
            sizes="(min-width: 768px) 25vw, 100vw"
            priority={i < 2}
            onEnter={() => {
              setActive(i);
              setHovering(true);
            }}
            onLeave={() => setHovering(false)}
            underlay={
              <span className={styles.pano} aria-hidden="true" style={{ opacity: hovering ? 1 : 0 }}>
                <span
                  className={styles.panoImg}
                  style={{ width: `${services.length * 100}%`, left: `${-i * 100}%`, backgroundImage: `url(${services[active].image})` }}
                />
              </span>
            }
          />
        </Reveal>
      ))}
    </div>
  );
}
