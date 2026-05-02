import { useState, useEffect } from 'react';

const LINKS = [
  { label: 'About',      href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Gallery',    href: '#gallery' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Contact',    href: '#contact' },
];

export default function Nav() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`rp-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="rp-nav-inner">
        <a href="#hero" className="rp-nav-logo">AB</a>

        <ul className={`rp-nav-links${menuOpen ? ' open' : ''}`}>
          {LINKS.map(l => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="rp-nav-actions">
          <a href="/" className="rp-nav-switch">3D Scene</a>
          <a href="/portfolio.html" className="rp-nav-switch">2D Classic</a>
        </div>

        <button
          className="rp-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }} />
        </button>
      </div>
    </nav>
  );
}
