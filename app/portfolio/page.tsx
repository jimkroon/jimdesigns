import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export const metadata: Metadata = {
  title: "Portfolio | JimDesigns",
  description: "Bekijk de Berfume-webshop als echte projectcase van JimDesigns.",
};

export default function PortfolioPage() {
  return (
    <>
      <a className="skip-link" href="#main">Ga naar de inhoud</a>
      <SiteHeader current="portfolio" />

      <main id="main" className="portfolio-page">
        <section className="portfolio-hero page-shell" aria-labelledby="portfolio-title">
          <div className="portfolio-hero-copy">
            <h1 id="portfolio-title">Mijn werk, in het echt.</h1>
            <p>Bekijk hoe een sterk ontwerp uitgroeit tot een volledige webshop.</p>
            <a className="button button-accent" href="#berfume">Bekijk de case</a>
          </div>
          <a
            className="portfolio-hero-media"
            href="https://berfume.nl"
            target="_blank"
            rel="noreferrer"
            aria-label="Open de website van Berfume in een nieuw tabblad"
          >
            <Image
              src="/images/berfume-macbook-higgsfield.png"
              alt="De door JimDesigns gemaakte Berfume-webshop op een MacBook in een koele studio-opstelling"
              fill
              priority
              sizes="(max-width: 820px) 100vw, 68vw"
            />
          </a>
        </section>

        <section className="portfolio-project page-shell" id="berfume" aria-labelledby="project-title">
          <div className="project-intro">
            <h2 id="project-title">Berfume.nl</h2>
            <p>Voor Berfume ontwierp en bouwde ik een webshop waarin collectie, geurmatch en merkverhaal helder samenkomen.</p>
            <a className="text-link project-link" href="https://berfume.nl" target="_blank" rel="noreferrer">
              Bezoek de website
            </a>
          </div>

          <div className="project-facts" aria-label="Projectonderdelen">
            <div><strong>Ontwerp</strong><span>Visuele richting en duidelijke pagina-opbouw</span></div>
            <div><strong>Bouw</strong><span>Van ontwerp naar een werkende webshop</span></div>
            <div><strong>Structuur</strong><span>Collectie, geurmatch, sets en merkverhaal</span></div>
          </div>

          <a
            className="project-browser"
            href="https://berfume.nl"
            target="_blank"
            rel="noreferrer"
            aria-label="Bekijk de live Berfume-webshop in een nieuw tabblad"
          >
            <Image
              src="/images/berfume-site-home.png"
              alt="Homepage van de Berfume-webshop met de hero Iconische geuren, opnieuw verteld"
              fill
              sizes="(max-width: 760px) 100vw, 92vw"
            />
          </a>

          <div className="project-detail-grid">
            <div className="project-detail-copy">
              <h3>Een merkervaring die meteen duidelijk voelt.</h3>
              <p>De donkere hero, grote typografie en directe routes naar collectie en geurmatch geven de webshop een eigen gezicht.</p>
            </div>
            <a
              className="project-detail-media"
              href="https://berfume.nl"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Berfume.nl in een nieuw tabblad"
            >
            <Image
                src="/images/berfume-macbook-higgsfield.png"
                alt="Berfume-webshop gepresenteerd op een MacBook"
              fill
                sizes="(max-width: 760px) 100vw, 52vw"
            />
            </a>
          </div>
        </section>

        <section className="portfolio-principle page-shell" aria-labelledby="principle-title">
          <h2 id="principle-title">Van eerste indruk tot werkende shop.</h2>
          <p>Ik ontwerp niet alleen het beeld. Ik bouw de pagina&apos;s en zorg dat bezoekers hun weg kunnen vinden.</p>
        </section>

        <section className="contact page-shell" aria-labelledby="portfolio-contact-title">
          <div className="contact-copy">
            <h2 id="portfolio-contact-title">Jouw website hierna?</h2>
            <p>Vertel me wat je bedrijf nodig heeft. Je spreekt direct met Jim.</p>
          </div>
          <div className="contact-action">
            <a className="button button-paper" href="mailto:info@jimdesigns.nl">Bespreek je website</a>
            <a className="contact-email" href="mailto:info@jimdesigns.nl" translate="no">info@jimdesigns.nl</a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
