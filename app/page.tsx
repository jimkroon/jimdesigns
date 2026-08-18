import Image from "next/image";
import { SiteFooter, SiteHeader } from "./SiteChrome";

const services = [
  {
    title: "Webdesign",
    copy: "Een heldere visuele richting die past bij je bedrijf, je klanten en wat je wilt bereiken.",
  },
  {
    title: "Development",
    copy: "Maatwerk in code dat snel laadt, logisch werkt en op ieder scherm overtuigt.",
  },
  {
    title: "Shopify",
    copy: "Webshops in Shopify waarin merkbeleving en een duidelijke route naar aankoop samenkomen.",
  },
  {
    title: "SEO",
    copy: "Een sterke technische en inhoudelijke basis waarmee zoekmachines je website goed begrijpen.",
  },
];

const process = [
  {
    title: "Luisteren",
    copy: "We maken je bedrijf, doelgroep en doel eerst scherp. Zo begint het ontwerp met inhoud in plaats van een template.",
  },
  {
    title: "Ontwerpen",
    copy: "Structuur, tekst en visuele richting groeien samen tot een website met een herkenbaar eigen gezicht.",
  },
  {
    title: "Bouwen",
    copy: "Ik ontwikkel het ontwerp responsive, test de belangrijke details en lever alles zorgvuldig op.",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Ga naar de inhoud</a>

      <SiteHeader />

      <main id="main">
        <section className="hero page-shell" aria-labelledby="hero-title">
          <div className="hero-frame">
            <Image
              src="/images/jimdesigns-hero-editorial-v3.png"
              alt="Jonge handen, wireframes, een laptop en kobaltblauw materiaal tijdens het ontwerpen van een website"
              fill
              priority
              sizes="(max-width: 720px) 100vw, 1480px"
            />
            <div className="hero-copy">
              <h1 id="hero-title">Websites met karakter.</h1>
              <p>Persoonlijk ontworpen en gebouwd voor lokale ondernemers en kleine bedrijven.</p>
              <div className="hero-actions">
                <a className="button button-accent" href="mailto:info@jimdesigns.nl">Bespreek je website</a>
                <a className="text-link" href="#werkwijze">Bekijk mijn werkwijze</a>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-rail page-shell" aria-label="Waarom JimDesigns">
          <p><strong>Ontwerp en bouw</strong><span>in één hand</span></p>
          <p><strong>Direct contact</strong><span>met de maker</span></p>
          <p><strong>Helder proces</strong><span>van idee tot oplevering</span></p>
        </section>

        <section className="home-work page-shell" aria-labelledby="home-work-title">
          <figure className="home-work-media">
            <Image
              src="/images/jimdesigns-hero-higgsfield-v2.jpg"
              alt="Jonge ontwerper aan een koele werktafel met laptop, schetsen en kobaltblauw materiaal"
              fill
              sizes="(max-width: 760px) 100vw, 70vw"
            />
          </figure>
          <div className="home-work-copy">
            <h2 id="home-work-title">Eén project. Volledig bekeken.</h2>
            <p>Geen gevulde etalage met verzonnen werk, maar een eerlijk portfolio met proces, keuzes en detail.</p>
            <a className="button button-paper" href="/portfolio">Bekijk portfolio</a>
          </div>
        </section>

        <section className="services page-shell" id="diensten" aria-labelledby="services-title">
          <div className="section-heading">
            <h2 id="services-title">Van eerste idee tot werkende website.</h2>
            <p>Strategie, ontwerp en techniek blijven bij elkaar. Dat maakt keuzes duidelijker en het eindresultaat sterker.</p>
          </div>

          <div className="service-list">
            {services.map((service) => (
              <article className="service-row" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="design-build page-shell" aria-labelledby="design-build-title">
          <figure className="design-build-media">
            <Image
              src="/images/jimdesigns-materials-v2.jpg"
              alt="Kobaltblauw acryl, zilver, papier en zwarte grafische vormen op een werktafel"
              fill
              sizes="(max-width: 760px) 100vw, 62vw"
            />
          </figure>
          <div className="design-build-copy material-reveal">
            <h2 id="design-build-title">Geen overdracht tussen ontwerp en code.</h2>
            <p>Ik ontwerp en bouw zelf. Daardoor blijven de details uit het ontwerp ook overeind in de uiteindelijke website.</p>
          </div>
        </section>

        <section className="process page-shell" id="werkwijze" aria-labelledby="process-title">
          <div className="process-intro">
            <h2 id="process-title">Eerst begrijpen. Dan maken.</h2>
            <p>Een compact proces, duidelijke keuzes en één aanspreekpunt.</p>
          </div>

          <div className="process-grid">
            <figure className="process-media">
              <Image
                src="/images/jimdesigns-process-higgsfield-v2.jpg"
                alt="Jonge handen tekenen een mobiele website naast wireframes, een laptop en een liniaal"
                fill
                sizes="(max-width: 820px) 100vw, 58vw"
              />
            </figure>

            <ol className="process-steps">
              {process.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="about page-shell" id="over" aria-labelledby="about-title">
          <figure className="about-media">
            <Image
              src="/images/jimdesigns-studio-higgsfield-v2.jpg"
              alt="Compacte werkplek van JimDesigns met laptop, schetsboek en kobaltblauw materiaal"
              fill
              sizes="(max-width: 820px) 100vw, 70vw"
            />
          </figure>
          <div className="about-copy">
            <h2 id="about-title">Klein in omvang. Dicht op het werk.</h2>
            <p>Ik ben Jim, ontwerper en developer achter JimDesigns. Je schakelt rechtstreeks met mij, van het eerste idee tot de laatste technische controle.</p>
            <p>Dat houdt de communicatie snel en zorgt dat ontwerp, inhoud en bouw één geheel blijven.</p>
          </div>
        </section>

        <section className="contact page-shell" id="contact" aria-labelledby="contact-title">
          <div className="contact-copy">
            <h2 id="contact-title">Een website in gedachten?</h2>
            <p>Vertel me kort over je bedrijf en wat je wilt verbeteren. Je spreekt direct met Jim.</p>
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
