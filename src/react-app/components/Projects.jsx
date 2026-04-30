import { useState, useEffect } from 'react';
import { PROJECTS }   from '../../projects-data.js';
import SpotlightCard  from '../bits/SpotlightCard.jsx';
import ScrollReveal   from '../bits/ScrollReveal.jsx';
import GradientText   from '../bits/GradientText.jsx';

export default function Projects() {
  const [selected, setSelected] = useState(null);

  // Close on Escape
  useEffect(() => {
    if (!selected) return;
    const fn = (e) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [selected]);

  const entries = Object.entries(PROJECTS);

  return (
    <section id="projects" className="rp-section">
      <div className="rp-container">
        <ScrollReveal>
          <h2 className="rp-section-title">
            <GradientText colors={['#22c55e', '#86efac', '#4ade80', '#22c55e']} animationSpeed={9}>
              Projects
            </GradientText>
          </h2>
        </ScrollReveal>

        <div className="rp-proj-grid">
          {entries.map(([id, p], i) => (
            <ScrollReveal key={id} delay={i * 60}>
              <SpotlightCard
                className="rp-proj-card"
                spotlightColor="rgba(34,197,94,0.18)"
                onClick={() => setSelected(p)}
              >
                <div className="rp-proj-thumb" style={{ background: p.gradient }}>
                  {p.image && <img src={p.image} alt={p.title} loading="lazy" />}
                </div>
                <div className="rp-proj-body">
                  <span className={`rp-badge ${p.status}`}>{p.statusLabel}</span>
                  <h3 className="rp-proj-title">{p.title}</h3>
                  <p className="rp-proj-category">{p.category} · {p.period}</p>
                  <p className="rp-proj-desc">{p.description}</p>
                  <div className="rp-chips">
                    {p.chips.slice(0, 5).map(c => <span key={c}>{c}</span>)}
                    {p.chips.length > 5 && <span>+{p.chips.length - 5}</span>}
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function ProjectModal({ project: p, onClose }) {
  return (
    <div className="rp-modal-backdrop" onClick={onClose} role="dialog" aria-modal>
      <div className="rp-modal" onClick={e => e.stopPropagation()}>
        <button className="rp-modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="rp-modal-hero" style={{ background: p.gradient }}>
          {p.image && <img src={p.image} alt={p.title} />}
        </div>
        <div className="rp-modal-body">
          <div className="rp-modal-title-row">
            <h2>{p.title}</h2>
            <span className={`rp-badge ${p.status}`}>{p.statusLabel}</span>
          </div>
          <p className="rp-modal-meta">{p.category} · {p.period}</p>
          {p.company && (
            <p className="rp-modal-role">{p.role} at <span>{p.company}</span></p>
          )}
          <p className="rp-modal-desc">{p.description}</p>

          <h3>Highlights</h3>
          <ul className="rp-modal-highlights">
            {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>

          <h3>Tech Stack</h3>
          <div className="rp-chips">
            {p.chips.map(c => <span key={c}>{c}</span>)}
          </div>

          {p.links && p.links.length > 0 && (
            <div className="rp-modal-links">
              {p.links.map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener" className="rp-modal-link">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
