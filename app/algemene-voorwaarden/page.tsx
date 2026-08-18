import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export const metadata: Metadata = {
  title: "Algemene voorwaarden | JimDesigns",
  description: "Informatie over de algemene voorwaarden van JimDesigns.",
};

export default function TermsPage() {
  return (
    <>
      <a className="skip-link" href="#main">Ga naar de inhoud</a>
      <SiteHeader />
      <main id="main" className="legal-page page-shell">
        <h1>Algemene voorwaarden</h1>
        <p className="legal-intro">De definitieve algemene voorwaarden worden vóór publicatie van de website juridisch gecontroleerd en hier geplaatst.</p>
        <section>
          <h2>Nu al een vraag?</h2>
          <p>Neem rechtstreeks contact op via <a href="mailto:info@jimdesigns.nl">info@jimdesigns.nl</a>. Afspraken over een opdracht worden altijd vooraf duidelijk vastgelegd.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
