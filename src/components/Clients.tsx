import Image from "next/image";
import { clients } from "@/content/site";
import styles from "./Clients.module.css";

export function Clients() {
  return (
    <section className="section" aria-labelledby="clients-title">
      <div className="container">
        <div className="section-head">
          <h2 id="clients-title" className="h2">
            Bizə etibar edənlər
          </h2>
          <p className="lead">25-dən çox korporativ müştəri</p>
        </div>
        <ul className={styles.grid}>
          {clients.map((c, i) => (
            <li key={`${c.name}-${i}`} className={styles.cell}>
              {c.logo ? <Image src={c.logo} alt={c.name} width={140} height={56} className={styles.logo} /> : <span>{c.name}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
