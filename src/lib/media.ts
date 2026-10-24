/** Hero videoları səhifənin ilk yüklənməsini yavaşlatmasın deyə istifadə olunan köməkçilər */

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** İstifadəçi trafikə qənaət rejimindədirsə və ya bağlantı çox zəifdirsə videolar avtomatik oynamır */
export function prefersLightMedia(): boolean {
  const c = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
}

/** Səhifə tam yükləndikdən `delay` ms sonra çağırılır (əsas məzmun və LCP gecikmir). Qaytarılan funksiya ləğv edir. */
export function afterLoad(cb: () => void, delay = 1500): () => void {
  let timer: number | undefined;
  const run = () => {
    timer = window.setTimeout(cb, delay);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("load", run);
  };
}
