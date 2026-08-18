import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "./MobileNav";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`} translate="no">
      <Image src="/images/jimdesigns-logo.svg" alt="" width={42} height={39} priority={!compact} />
      <span className="brand-word"><b>jim</b>designs</span>
    </span>
  );
}

export function SiteHeader({ current = "home" }: { current?: "home" | "portfolio" }) {
  return (
    <header className="site-header" id="top">
      <div className="page-shell header-inner">
        <Link href="/" aria-label="JimDesigns home">
          <Brand />
        </Link>

        <nav className="desktop-nav" aria-label="Hoofdnavigatie">
          <Link href="/#diensten">Diensten</Link>
          <Link href="/portfolio" aria-current={current === "portfolio" ? "page" : undefined}>Portfolio</Link>
          <Link href="/#werkwijze">Werkwijze</Link>
          <Link href="/#over">Over Jim</Link>
        </nav>

        <a className="button button-ink header-cta" href="mailto:info@jimdesigns.nl">
          Bespreek je website
        </a>

        <MobileNav current={current} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-lead">
        <div className="footer-mark" aria-hidden="true">
          <Image src="/images/jimdesigns-logo.svg" alt="" width={285} height={265} />
        </div>
        <div className="footer-statement">
          <p>Een website die echt bij je bedrijf past.</p>
          <a className="button button-paper" href="mailto:info@jimdesigns.nl">Bespreek je website</a>
        </div>
      </div>

      <div className="page-shell footer-grid">
        <div>
          <Brand compact />
          <p className="footer-description">Webdesign, development, Shopify en SEO voor lokale ondernemers en kleine bedrijven.</p>
        </div>
        <nav aria-label="Footernavigatie">
          <Link href="/">Home</Link>
          <Link href="/#diensten">Diensten</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/#werkwijze">Werkwijze</Link>
        </nav>
        <div className="footer-contact">
          <span>Rechtstreeks contact</span>
          <a href="mailto:info@jimdesigns.nl" translate="no">info@jimdesigns.nl</a>
        </div>
      </div>

      <div className="page-shell footer-base">
        <p>© 2026 JimDesigns</p>
        <nav className="footer-legal" aria-label="Juridische informatie">
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
          <Link href="/privacybeleid">Privacybeleid</Link>
          <Link href="/cookiebeleid">Cookiebeleid</Link>
        </nav>
        <a href="#top">Terug naar boven</a>
      </div>
    </footer>
  );
}
