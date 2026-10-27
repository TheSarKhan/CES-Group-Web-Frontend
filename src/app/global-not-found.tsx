import "@fontsource-variable/manrope";
import "./globals.css";

/** Heç bir marşrutla uyğun gəlməyən ünvanlar üçün (səhifənin öz 404-ü [lang]/not-found.tsx-dədir) */
export default function GlobalNotFound() {
  return (
    <html lang="az">
      <body>
        <main id="main" className="section">
          <div className="container" style={{ display: "grid", gap: 24, justifyItems: "start", minHeight: "60vh", alignContent: "center" }}>
            <h1 className="h1">Səhifə tapılmadı</h1>
            <p className="lead">Axtardığınız səhifə mövcud deyil və ya köçürülüb.</p>
            <a href="/" className="btn btn-dark">
              Ana səhifəyə qayıt
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
