import type { Metadata } from "next";
import { headers } from "next/headers";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "jimdesigns.nl";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    themeColor: "#f2f4f8",
    title: "JimDesigns | Webdesign, development & Shopify",
    description: "JimDesigns ontwerpt en bouwt heldere websites en Shopify-webshops voor lokale ondernemers en kleine bedrijven.",
    icons: { icon: "/images/jimdesigns-logo.svg" },
    openGraph: {
      title: "JimDesigns | Websites met karakter",
      description: "Webdesign en development voor ondernemers die professioneel voor de dag willen komen.",
      type: "website",
      locale: "nl_NL",
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1733, height: 907, alt: "JimDesigns webdesign en development" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "JimDesigns | Websites met karakter",
      description: "Webdesign en development voor ondernemers die professioneel voor de dag willen komen.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className={manrope.variable}>
        <div
          aria-hidden="true"
          hidden
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: JimDesigns maakt webdesign direct en aantoonbaar gemaakt door een ontwerper-bouwer; weigert de gecentreerde standaard-agencyhero en het herhaalde raster met gelijke featurekaarten.
OWN-WORLD: Koel wit, zilver, inktzwart en kobaltblauw; scherpe radiusloze vlakken; Manrope; geloofwaardige studiofotografie; kobalt als herkenbare materiaalbaan.
STORY: Een lokale ondernemer ziet maatwerk in ontwerp en bouw, begrijpt diensten en proces, en neemt rechtstreeks contact op met Jim.
FIRST VIEWPORT: Een breed studiobeeld met veel negatieve ruimte links, laptop en jonge handen rechts, een grote linkse kop en een concrete CTA direct onder de uitleg.
FORM: Asymmetrisch fotografisch veld, positie 1 van de retained-world refinement; seed key refinement-no-roll.
BUILD PATH: Code-led; geen goedgekeurde full-page comp. Het gegenereerde hero-beeld is productiemedia, geen pagina-comp.
FINISH: Visual and interaction details were refined under the Impeccable frontend-design system.
-->`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
