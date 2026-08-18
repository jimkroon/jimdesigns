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
    title: "JimDesigns | Webdesign, development & Shopify",
    description: "JimDesigns ontwerpt en bouwt heldere websites en Shopify-webshops voor lokale ondernemers en kleine bedrijven.",
    icons: { icon: "/images/jimdesigns-logo-mark.png" },
    openGraph: {
      title: "JimDesigns | Meer dan een template",
      description: "Webdesign en development voor ondernemers die professioneel voor de dag willen komen.",
      type: "website",
      locale: "nl_NL",
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1733, height: 907, alt: "JimDesigns webdesign en development" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "JimDesigns | Meer dan een template",
      description: "Webdesign en development voor ondernemers die professioneel voor de dag willen komen.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
