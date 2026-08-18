"use client";

import { useRef } from "react";

export function MobileNav() {
  const menu = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    menu.current?.removeAttribute("open");
  }

  return (
    <details className="mobile-nav" ref={menu}>
      <summary>Menu</summary>
      <div className="mobile-nav-panel">
        <nav aria-label="Mobiele navigatie">
          <a href="#diensten" onClick={closeMenu}>Diensten</a>
          <a href="#werkwijze" onClick={closeMenu}>Werkwijze</a>
          <a href="#over" onClick={closeMenu}>Over Jim</a>
        </nav>
        <a className="button button-accent" href="mailto:hello@jimdesigns.nl" onClick={closeMenu}>
          Kennismaken <span aria-hidden="true">↗</span>
        </a>
      </div>
    </details>
  );
}
