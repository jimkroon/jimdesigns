import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export const metadata: Metadata = {
  title: "Cookiebeleid | JimDesigns",
  description: "Informatie over cookies op de website van JimDesigns.",
};

export default function CookiePage() {
  return (
    <>
      <a className="skip-link" href="#main">Ga naar de inhoud</a>
      <SiteHeader />
      <main id="main" className="legal-page page-shell">
        <h1>Cookiebeleid</h1>
        <p className="legal-intro">Het definitieve cookiebeleid wordt vóór publicatie afgestemd op de technische cookies en eventuele analytics die JimDesigns daadwerkelijk gebruikt.</p>
        <section>
          <h2>Transparant gebruik</h2>
          <p>Niet-noodzakelijke cookies worden pas toegevoegd nadat doel, bewaartermijn en toestemming duidelijk zijn ingericht.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
