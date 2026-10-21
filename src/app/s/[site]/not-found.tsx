import Link from "next/link";
import styles from "@/components/subsite/Pages.module.css";

export default function SubSiteNotFound() {
  return (
    <div className={styles.notFound}>
      <h1 className="h1">Səhifə tapılmadı</h1>
      <p className="lead">Axtardığınız səhifə mövcud deyil və ya köçürülüb.</p>
      <Link href="/" className="btn btn-dark">
        Ana səhifəyə qayıt
      </Link>
    </div>
  );
}
