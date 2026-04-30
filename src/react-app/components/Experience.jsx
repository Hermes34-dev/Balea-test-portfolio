import ScrollReveal from '../bits/ScrollReveal.jsx';
import GradientText  from '../bits/GradientText.jsx';

const ITEMS = [
  {
    role:    'Research Engineer',
    company: 'Gradiant',
    date:    '01/2025 – Present',
    edu:     false,
    bullets: [
      'European-level projects with INCIBE & international police authorities.',
      <>Framework / Backend / DevOps for <em>fAIr</em> — SaaS multimodal AI detection platform.</>,
      'Presented multiple technical talks company-wide.',
    ],
    chips: ['C++', 'Python', 'Docker', 'RabbitMQ', 'OpenSSL', 'REST API'],
  },
  {
    role:    'Junior Tools Programmer',
    company: 'Tequila Works',
    date:    '07/2022 – 10/2024',
    edu:     false,
    bullets: [
      <><em>Song of Nunu: A League of Legends Story</em> + 3 unannounced projects.</>,
      'Tools for art, localisation & level-design departments.',
      'Source-control tooling for Perforce.',
    ],
    chips: ['C++', 'Python', 'JavaScript', 'Perforce', 'Unreal Engine 5'],
  },
  {
    role:    'BSc Computer Science — Real-Time Interactive Simulation',
    company: 'DigiPen Institute of Technology Europe · Bilbao',
    date:    '09/2018 – 04/2022',
    edu:     true,
    bullets: [],
    chips:   [],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="rp-section rp-section-alt">
      <div className="rp-container">
        <ScrollReveal>
          <h2 className="rp-section-title">
            <GradientText colors={['#22c55e', '#86efac', '#4ade80', '#22c55e']} animationSpeed={9}>
              Experience
            </GradientText>
          </h2>
        </ScrollReveal>

        <div className="rp-timeline">
          {ITEMS.map((item, i) => (
            <ScrollReveal key={item.role} delay={i * 100} className="rp-tl-item">
              <div className={`rp-tl-dot${item.edu ? ' rp-tl-dot-edu' : ''}`} />
              <div className="rp-tl-card">
                <div className="rp-tl-header">
                  <div>
                    <p className="rp-tl-role">{item.role}</p>
                    <p className="rp-tl-company">{item.company}</p>
                  </div>
                  <span className="rp-tl-date">{item.date}</span>
                </div>
                {item.bullets.length > 0 && (
                  <ul className="rp-tl-bullets">
                    {item.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
                {item.chips.length > 0 && (
                  <div className="rp-chips">
                    {item.chips.map(c => <span key={c}>{c}</span>)}
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
