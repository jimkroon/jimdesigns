import Image from "next/image";

const services = [
  ["Webdesign", "Een heldere visuele richting die past bij je bedrijf, je klanten en wat je wilt bereiken."],
  ["Development", "Maatwerk in code dat snel laadt, logisch werkt en op ieder scherm goed staat."],
  ["Shopify", "Een webshop waarin merkbeleving en een duidelijke route naar aankoop samenkomen."],
  ["SEO", "Een sterke technische en inhoudelijke basis waarmee zoekmachines je website goed kunnen begrijpen."],
];

const process = [
  ["Luisteren", "We brengen je bedrijf, doelgroep en doelen terug tot een duidelijke opdracht."],
  ["Ontwerpen", "Structuur, stijl en inhoud groeien samen tot een website met een eigen gezicht."],
  ["Bouwen", "Het ontwerp wordt responsive ontwikkeld, getest en zorgvuldig opgeleverd."],
];

export default function Home() {
  return (
    <>
      <header className="site-header page-shell">
        <a className="brand" href="#top" aria-label="JimDesigns home">
          <Image src="/images/jimdesigns-logo-mark.png" alt="" width={42} height={39} priority />
          <span><b>jim</b>designs</span>
        </a>
        <nav aria-label="Hoofdnavigatie">
          <a href="#diensten">Diensten</a>
          <a href="#werkwijze">Werkwijze</a>
          <a href="#over">Over Jim</a>
        </nav>
        <a className="button button-dark" href="mailto:hello@jimdesigns.nl">Kennismaken <span aria-hidden="true">↗</span></a>
      </header>

      <main id="top">
        <section className="hero page-shell">
          <div className="hero-copy">
            <h1>Meer dan een template.</h1>
            <p>Ik ontwerp en bouw heldere websites en Shopify-webshops voor ondernemers die professioneel voor de dag willen komen.</p>
            <div className="hero-actions">
              <a className="button button-accent" href="mailto:hello@jimdesigns.nl">Kennismaken <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#werkwijze">Bekijk de werkwijze</a>
            </div>
          </div>

          <figure className="hero-work">
            <div className="hero-image">
              <Image src="/images/jimdesigns-hero-v2.jpg" alt="Kobaltblauw acryl, papier en een laptop in de beeldtaal van JimDesigns" fill priority sizes="(max-width: 900px) 100vw, 54vw" />
            </div>
          </figure>
        </section>

        <section className="intro page-shell reveal">
          <p>Een sterke website maakt snel duidelijk wat je doet, voelt vertrouwd en geeft mensen een reden om contact op te nemen.</p>
          <div>
            <span>Persoonlijk contact</span>
            <span>Ontwerp en bouw</span>
            <span>Heldere afspraken</span>
          </div>
        </section>

        <section className="services page-shell" id="diensten">
          <div className="section-heading reveal">
            <h2>Alles voor een sterke online basis.</h2>
            <p>Van eerste richting tot een website die klaar is voor echte bezoekers.</p>
          </div>
          <div className="service-list">
            {services.map(([title, copy]) => (
              <article className="reveal" key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="process page-shell" id="werkwijze">
          <figure className="process-image reveal">
            <Image src="/images/jimdesigns-process-v2.jpg" alt="Wireframes, een kobaltblauwe liniaal en ontwerpmaterialen op een witte werktafel" fill sizes="(max-width: 900px) 100vw, 54vw" />
          </figure>
          <div className="process-copy">
            <div className="section-heading reveal">
              <h2>Eerst begrijpen. Dan ontwerpen.</h2>
              <p>Je krijgt een helder proces en één aanspreekpunt.</p>
            </div>
            <ol>
              {process.map(([title, copy]) => (
                <li className="reveal" key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="about page-shell" id="over">
          <div className="about-copy reveal">
            <h2>Klein in omvang. Dicht op het werk.</h2>
            <p>Ik ben Jim, ontwerper en developer achter JimDesigns. Je schakelt rechtstreeks met mij, van het eerste idee tot de laatste technische controle.</p>
            <p>Dat houdt de communicatie snel en zorgt dat ontwerp, inhoud en bouw één geheel blijven.</p>
          </div>
          <figure className="about-image reveal">
            <Image src="/images/jimdesigns-materials-v2.jpg" alt="Kobaltblauw acryl, papier en metaal als materialen voor de JimDesigns-beeldtaal" fill sizes="(max-width: 900px) 100vw, 46vw" />
          </figure>
        </section>

        <section className="contact page-shell" id="contact">
          <Image src="/images/jimdesigns-logo-mark.png" alt="" width={116} height={108} />
          <div className="reveal">
            <h2>Klaar voor een website die wél bij je bedrijf past?</h2>
            <a className="button button-light" href="mailto:hello@jimdesigns.nl">Kennismaken <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>

      <footer className="site-footer page-shell">
        <a className="brand" href="#top" aria-label="Terug naar boven"><span><b>jim</b>designs</span></a>
        <p>Webdesign, development, Shopify en SEO.</p>
        <a href="mailto:hello@jimdesigns.nl">hello@jimdesigns.nl</a>
      </footer>
    </>
  );
}
