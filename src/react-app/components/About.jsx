import ScrollReveal  from '../bits/ScrollReveal.jsx';
import GradientText  from '../bits/GradientText.jsx';
import BorderGlow    from '../bits/BorderGlow.jsx';

const FACTS = [
  { n: '3+',  l: 'Years Industry' },
  { n: 'C++', l: 'Primary Lang'   },
  { n: '🇪🇸',  l: 'Bilbao, Spain'  },
  { n: '7',   l: 'Spoken Languages' },
];

// Inline styles matching rp-fact-card layout
const factInner = {
  padding: '20px 18px',
  textAlign: 'center',
  background: 'transparent',
};

export default function About() {
  return (
    <section id="about" className="rp-section">
      <div className="rp-container">
        <ScrollReveal>
          <h2 className="rp-section-title">
            <GradientText colors={['#22c55e', '#86efac', '#4ade80', '#22c55e']} animationSpeed={9}>
              About
            </GradientText>
          </h2>
        </ScrollReveal>

        <div className="rp-about-grid">
          <ScrollReveal direction="left">
            <div className="rp-about-bio">
              <p>
                Research Engineer at <strong>Gradiant</strong>, working on European AI
                fraud-detection projects in partnership with INCIBE and international
                police authorities. Previously <em>Junior Tools Programmer</em> at
                Tequila Works, shipping Song of Nunu and three unannounced titles.
              </p>
              <p>
                BSc in Computer Science in Real-Time Interactive Simulation —
                DigiPen Institute of Technology Europe, Bilbao (2018–2022).
                The Cornell Box on my business card? I wrote the raytracer that rendered it.
              </p>
            </div>
          </ScrollReveal>

          <div className="rp-about-facts">
            {FACTS.map((f, i) => (
              <ScrollReveal key={f.l} delay={i * 80} direction="right">
                <BorderGlow
                  animated
                  edgeSensitivity={29}
                  borderRadius={12}
                  glowColor="142 70 55"
                  backgroundColor="#111f15"
                  colors={['#22c55e', '#86efac', '#4ade80']}
                  glowIntensity={0.9}
                  coneSpread={35}
                  glowRadius={36}
                >
                  <div style={factInner}>
                    <span className="rp-fact-n">{f.n}</span>
                    <span className="rp-fact-l">{f.l}</span>
                  </div>
                </BorderGlow>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
