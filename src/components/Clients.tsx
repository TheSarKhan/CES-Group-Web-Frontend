import Image from "next/image";
import { getClients } from "@/content/loaders";
import styles from "./Clients.module.css";

/** Müştəri loqoları üfüqi sürüşən lent kimi gedir; üzərinə gələndə dayanır. */
export async function Clients() {
  const clients = await getClients();
  return (
    <section className="section" aria-labelledby="clients-title">
      <div className="container">
        <div className="section-head">
          <h2 id="clients-title" className="h2">
            Bizə güvənənlər
          </h2>
          <p className="lead">150+ müştəridən ən tanınmışları</p>
        </div>
      </div>

      <div className={styles.marquee}>
        {/* Lent fasiləsiz dövr etsin deyə siyahı iki dəfə yazılır; ikinci yarı ekran oxuyuculardan gizlədilir */}
        <ul className={styles.track}>
          {[0, 1].map((copy) =>
            clients.map((c) => (
              <li key={`${copy}-${c.name}`} className={styles.chip} aria-hidden={copy === 1 || undefined}>
                <Image src={c.logo} alt={copy === 0 ? c.name : ""} width={240} height={80} sizes="160px" className={styles.logo} />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
