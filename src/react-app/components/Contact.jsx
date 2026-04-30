import ScrollReveal from '../bits/ScrollReveal.jsx';
import GradientText  from '../bits/GradientText.jsx';
import SpotlightCard from '../bits/SpotlightCard.jsx';

const PHONE_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
);
const EMAIL_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const WEB_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

const LINKS = [
  { label: 'Phone',   value: '+34 638 79 34 03',               href: 'tel:+34638793403',                        icon: PHONE_SVG },
  { label: 'Email',   value: 'contact.AlejandroBalea@gmail.com', href: 'mailto:contact.AlejandroBalea@gmail.com', icon: EMAIL_SVG },
  { label: 'Website', value: 'www.alejandrobalea.com',           href: 'https://www.alejandrobalea.com',          icon: WEB_SVG   },
];

export default function Contact() {
  return (
    <section id="contact" className="rp-section rp-section-alt">
      <div className="rp-container rp-contact-container">
        <ScrollReveal>
          <h2 className="rp-section-title" style={{ textAlign: 'center' }}>
            <GradientText colors={['#22c55e', '#86efac', '#4ade80', '#22c55e']} animationSpeed={9}>
              Get in Touch
            </GradientText>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <p className="rp-contact-sub">
            Open to full-time roles, freelance projects, and collaboration in
            graphics, simulation, or backend engineering.
          </p>
        </ScrollReveal>

        <div className="rp-contact-grid">
          {LINKS.map((l, i) => (
            <ScrollReveal key={l.label} delay={i * 90}>
              <SpotlightCard className="rp-contact-card">
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel={l.href.startsWith('http') ? 'noopener' : undefined}
                  className="rp-contact-link"
                >
                  <span className="rp-contact-icon-wrap">{l.icon}</span>
                  <div className="rp-contact-info">
                    <span className="rp-contact-label">{l.label}</span>
                    <span className="rp-contact-value">{l.value}</span>
                  </div>
                  <span className="rp-contact-arrow">↗</span>
                </a>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
