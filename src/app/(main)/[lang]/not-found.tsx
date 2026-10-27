import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="section">
        <div className="container" style={{ display: "grid", gap: 24, justifyItems: "start", minHeight: "40vh", alignContent: "center" }}>
          <h1 className="h1">Səhifə tapılmadı</h1>
          <p className="lead">Axtardığınız səhifə mövcud deyil və ya köçürülüb.</p>
          <Link href="/" className="btn btn-dark">
            Ana səhifəyə qayıt
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
