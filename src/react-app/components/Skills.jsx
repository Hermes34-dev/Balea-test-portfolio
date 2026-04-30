import ScrollReveal from '../bits/ScrollReveal.jsx';
import GradientText  from '../bits/GradientText.jsx';

const LANG_ICONS_SRC = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

const LANGUAGES = [
  { name: 'C++',        src: `${LANG_ICONS_SRC}/cplusplus/cplusplus-original.svg` },
  { name: 'C',          src: `${LANG_ICONS_SRC}/c/c-original.svg` },
  { name: 'Python',     src: `${LANG_ICONS_SRC}/python/python-original.svg` },
  { name: 'Rust',       src: 'https://cdn.simpleicons.org/rust/ce422b' },
  { name: 'C#',         src: `${LANG_ICONS_SRC}/csharp/csharp-original.svg` },
  { name: 'Lua',        src: `${LANG_ICONS_SRC}/lua/lua-original.svg` },
  { name: 'JavaScript', src: `${LANG_ICONS_SRC}/javascript/javascript-original.svg` },
  { name: 'SQL',        src: `${LANG_ICONS_SRC}/postgresql/postgresql-original.svg` },
];

const TOOLS = [
  'OpenGL', 'Docker', 'RabbitMQ', 'Linux', 'S3 / MinIO', 'Git',
  'Perforce', 'OpenSSL', 'Unreal Engine 5', 'Unity', 'NVIDIA Nsight',
  'Computer Arch.', 'Backend', 'DevOps',
];

const SPOKEN = [
  { name: 'Spanish',    level: 'Native', cls: 'lvl-native' },
  { name: 'English',    level: 'C1',     cls: 'lvl-c1'     },
  { name: 'Basque',     level: 'B1',     cls: 'lvl-b1'     },
  { name: 'Japanese',   level: 'B1',     cls: 'lvl-b1'     },
  { name: 'German',     level: 'A2',     cls: 'lvl-a2'     },
  { name: 'French',     level: 'A2',     cls: 'lvl-a2'     },
  { name: 'Portuguese', level: 'A2',     cls: 'lvl-a2'     },
];

export default function Skills() {
  return (
    <section id="skills" className="rp-section">
      <div className="rp-container">
        <ScrollReveal>
          <h2 className="rp-section-title">
            <GradientText colors={['#22c55e', '#86efac', '#4ade80', '#22c55e']} animationSpeed={9}>
              Skills
            </GradientText>
          </h2>
        </ScrollReveal>

        {/* Programming Languages */}
        <ScrollReveal>
          <h3 className="rp-skills-sublabel">Programming Languages</h3>
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <div className="rp-lang-icons">
            {LANGUAGES.map(l => (
              <div className="rp-lang-item" key={l.name}>
                <img src={l.src} alt={l.name} width={36} height={36} loading="lazy" />
                <span>{l.name}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Tools */}
        <ScrollReveal delay={80}>
          <h3 className="rp-skills-sublabel" style={{ marginTop: 36 }}>Tools &amp; Frameworks</h3>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <div className="rp-tag-cloud">
            {TOOLS.map(t => <span key={t} className="rp-chip-skill">{t}</span>)}
          </div>
        </ScrollReveal>

        {/* Spoken languages */}
        <ScrollReveal delay={80}>
          <h3 className="rp-skills-sublabel" style={{ marginTop: 36 }}>Spoken Languages</h3>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <div className="rp-lang-table">
            {SPOKEN.map(s => (
              <div className="rp-lang-row" key={s.name}>
                <span className="rp-lang-name">{s.name}</span>
                <span className={`rp-lang-level ${s.cls}`}>{s.level}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
