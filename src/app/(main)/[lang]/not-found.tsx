import { Footer } from "@/components/Footer";
import { NotFoundView } from "@/components/NotFoundView";
import { availableLangs } from "@/content/loaders";

export default async function NotFound() {
  // Altbilgi yalnız məzmunu hazır olan dillər üçün qurulur (hazır olmayan dildə 404 altbilgisiz göstərilir)
  const langs = await availableLangs({ kind: "contact" });
  return <NotFoundView footers={Object.fromEntries(langs.map((l) => [l, <Footer key={l} lang={l} />]))} />;
}
