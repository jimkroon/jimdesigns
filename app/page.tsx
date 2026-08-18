import Image from "next/image";
import { MobileNav } from "./MobileNav";

const services = [
  {
    title: "Webdesign",
    copy: "Een heldere visuele richting die past bij je bedrijf, je klanten en wat je wilt bereiken.",
    className: "service-webdesign",
  },
  {
    title: "Development",
    copy: "Maatwerk in code dat snel laadt, logisch werkt en op ieder scherm goed staat.",
    className: "service-development",
  },
  {
    title: "Shopify",
    copy: "Een webshop waarin merkbeleving en een duidelijke route naar aankoop samenkomen.",
    className: "service-shopify",
  },
  {
    title: "SEO",
    copy: "Een sterke technische en inhoudelijke basis waarmee zoekmachines je website goed kunnen begrijpen.",
    className: "service-seo",
  },
];

const process = [
  ["Luisteren", "We brengen je bedrijf, doelgroep en doelen terug tot een duidelijke opdracht."],
  ["Ontwerpen", "Structuur, stijl en inhoud groeien samen tot een website met een eigen gezicht."],
  ["Bouwen", "Het ontwerp wordt responsive ontwikkeld, getest en zorgvuldig opgeleverd."],
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`} translate="no">
      <Image
        src="/images/jimdesigns-logo-mark.png"
        alt=""
        width={42}
        height={39}
        priority={!compact}
      />
      <span className="brand-word"><b>jim</b>designs</span>
    </span>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Ga naar de inhoud</a>

      <header className="site-header" id="top">
        <div className="page-shell header-inner">
          <a href="#top" aria-label="JimDesigns home">
            <Brand />
          </a>

          <nav className="desktop-nav" aria-label="Hoofdnavigatie">
            <a href="#diensten">Diensten</a>
            <a href="#werkwijze">Werkwijze</a>
            <a href="#over">Over Jim</a>
          </nav>

          <a className="button button-ink header-cta" href="mailto:hello@jimdesigns.nl">
            Kennismaken <span aria-hidden="true">↗</span>
          </a>

          <MobileNav />
        </div>
      </header>

      <main id="main">
        <section className="hero page-shell" aria-labelledby="hero-title">
          <div className="hero-copy hero-enter">
            <h1 id="hero-title">Meer dan een template.</h1>
            <p>Ik ontwerp en bouw heldere websites en Shopify-webshops voor ondernemers die professioneel voor de dag willen komen.</p>
            <div className="hero-actions">
              <a className="button button-accent" href="mailto:hello@jimdesigns.nl">
                Kennismaken <span aria-hidden="true">↗</span>
              </a>
              <a className="text-link" href="#werkwijze">Bekijk de werkwijze</a>
            </div>
          </div>

          <figure className="hero-media hero-enter hero-enter-late">
            <Image
              src="/images/jimdesigns-hero-higgsfield-v2.jpg"
              alt="Jonge handen, een laptop, wireframes en kobaltblauw materiaal tijdens het ontwerpen van een website"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 62vw"
            />
          </figure>
        </section>

        <section className="manifesto page-shell reveal-shift">
          <p>Een sterke website maakt snel duidelijk wat je doet, voelt vertrouwd en geeft mensen een reden om contact op te nemen.</p>
          <ul aria-label="Kernpunten van JimDesigns">
            <li>Persoonlijk contact</li>
            <li>Ontwerp en bouw</li>
            <li>Heldere afspraken</li>
          </ul>
        </section>

        <section className="services page-shell" id="diensten" aria-labelledby="services-title">
          <div className="section-intro reveal-shift">
            <h2 id="services-title">Alles voor een sterke online basis.</h2>
            <p>Van eerste richting tot een website die klaar is voor echte bezoekers.</p>
          </div>

          <div className="services-composition">
            {services.map((service) => (
              <article className={`service-block ${service.className} reveal-shift`} key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="case page-shell" aria-labelledby="case-title">
          <div className="case-copy reveal-shift">
            <h2 id="case-title">Eén project, straks volledig uitgewerkt.</h2>
            <p>Er is één project dat ik goed genoeg vind om prominent te tonen. Die case krijgt context, echte ontwerpkeuzes en echte screenshots.</p>
          </div>
          <div className="case-outline reveal-shift" aria-label="Onderdelen van de toekomstige projectcase">
            <span className="case-count" aria-hidden="true">1</span>
            <div>
              <p>De case wordt opgebouwd rond:</p>
              <ul>
                <li>Probleem en doelgroep</li>
                <li>Aanpak en ontwerpkeuzes</li>
                <li>Functies en screenshots</li>
                <li>Aantoonbaar resultaat</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="process page-shell" id="werkwijze" aria-labelledby="process-title">
          <div className="process-sticky">
            <div className="section-intro reveal-shift">
              <h2 id="process-title">Eerst begrijpen. Dan ontwerpen.</h2>
              <p>Je krijgt een helder proces en één aanspreekpunt.</p>
            </div>
            <figure className="process-media reveal-shift">
              <Image
                src="/images/jimdesigns-process-higgsfield-v2.jpg"
                alt="Jonge handen met een potlood, laptop, liniaal en wireframes tijdens het ontwerpproces"
                fill
                sizes="(max-width: 820px) 100vw, 48vw"
              />
            </figure>
          </div>

          <ol className="process-steps">
            {process.map(([title, copy]) => (
              <li className="reveal-shift" key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="about page-shell" id="over" aria-labelledby="about-title">
          <div className="about-copy reveal-shift">
            <h2 id="about-title">Klein in omvang. Dicht op het werk.</h2>
            <p>Ik ben Jim, ontwerper en developer achter JimDesigns. Je schakelt rechtstreeks met mij, van het eerste idee tot de laatste technische controle.</p>
            <p>Dat houdt de communicatie snel en zorgt dat ontwerp, inhoud en bouw één geheel blijven.</p>
          </div>
          <figure className="about-media reveal-shift">
            <Image
              src="/images/jimdesigns-studio-higgsfield-v2.jpg"
              alt="Compacte werkplek van JimDesigns met laptop, wireframes en een kobaltblauw materiaalstaal"
              fill
              sizes="(max-width: 820px) 100vw, 70vw"
            />
          </figure>
        </section>

        <section className="contact page-shell" id="contact" aria-labelledby="contact-title">
          <div className="contact-mark" aria-hidden="true">
            <Image src="/images/jimdesigns-logo-mark.png" alt="" width={122} height={114} />
          </div>
          <div className="contact-copy reveal-shift">
            <h2 id="contact-title">Klaar voor een website die wél bij je bedrijf past?</h2>
            <a className="button button-accent" href="mailto:hello@jimdesigns.nl">
              Kennismaken <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <a href="#top" aria-label="Terug naar boven"><Brand compact /></a>
          <p>Webdesign, development, Shopify en SEO.</p>
          <a href="mailto:hello@jimdesigns.nl" translate="no">hello@jimdesigns.nl</a>
          <p className="footer-note">Persoonlijk ontwerp en maatwerk in code.</p>
        </div>
      </footer>
    </>
  );
}
