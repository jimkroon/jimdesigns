"use client";

import { useRef } from "react";
import Link from "next/link";

export function MobileNav({ current = "home" }: { current?: "home" | "portfolio" }) {
  const menu = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    menu.current?.removeAttribute("open");
  }

  return (
    <details className="mobile-nav" ref={menu}>
      <summary>Menu</summary>
      <div className="mobile-nav-panel">
        <nav aria-label="Mobiele navigatie">
          <Link href="/#diensten" onClick={closeMenu}>Diensten</Link>
          <Link href="/portfolio" aria-current={current === "portfolio" ? "page" : undefined} onClick={closeMenu}>Portfolio</Link>
          <Link href="/#werkwijze" onClick={closeMenu}>Werkwijze</Link>
          <Link href="/#over" onClick={closeMenu}>Over Jim</Link>
        </nav>
        <a className="button button-accent" href="mailto:info@jimdesigns.nl" onClick={closeMenu}>
          Bespreek je website
        </a>
      </div>
    </details>
  );
}
