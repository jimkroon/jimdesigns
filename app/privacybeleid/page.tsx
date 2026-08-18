import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export const metadata: Metadata = {
  title: "Privacybeleid | JimDesigns",
  description: "Informatie over privacy bij JimDesigns.",
};

export default function PrivacyPage() {
  return (
    <>
      <a className="skip-link" href="#main">Ga naar de inhoud</a>
      <SiteHeader />
      <main id="main" className="legal-page page-shell">
        <h1>Privacybeleid</h1>
        <p className="legal-intro">De definitieve privacyverklaring wordt vóór publicatie juridisch gecontroleerd en afgestemd op de formulieren, hosting en analytics van deze website.</p>
        <section>
          <h2>Contact per e-mail</h2>
          <p>Wanneer je mailt naar <a href="mailto:info@jimdesigns.nl">info@jimdesigns.nl</a>, worden de gegevens uit je bericht alleen gebruikt om je vraag of aanvraag te beantwoorden.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
