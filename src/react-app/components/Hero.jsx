import Aurora      from '../bits/Aurora.jsx';
import BlurText    from '../bits/BlurText.jsx';
import GradientText from '../bits/GradientText.jsx';
import ShinyText   from '../bits/ShinyText.jsx';

export default function Hero() {
  return (
    <section id="hero" className="rp-hero">
      <Aurora
        colorStops={['#061a0d', '#0b4524', '#22c55e']}
        amplitude={1.1}
        speed={0.38}
        blend={0.42}
      />

      <div className="rp-hero-content">
        <p className="rp-hero-greeting">
          <ShinyText text="Research Engineer · C++ / Python Developer" speed={6} />
        </p>

        <h1 className="rp-hero-name">
          <BlurText text="Alejandro" delay={70}  direction="top" />
          <br />
          <BlurText text="Balea Moreno" delay={70} direction="top" />
        </h1>

        <h2 className="rp-hero-title">
          <GradientText
            colors={['#22c55e', '#86efac', '#4ade80', '#16a34a', '#22c55e']}
            animationSpeed={7}
          >
            Graphics · Backend · Engine
          </GradientText>
        </h2>

        <p className="rp-hero-sub">
          Building graphics systems, AI-detection backends, and developer tooling.
          Bilbao, Spain.
        </p>

        <div className="rp-hero-ctas">
          <a href="mailto:contact.AlejandroBalea@gmail.com" className="rp-btn rp-btn-primary">
            Get in touch
          </a>
          <a href="#projects" className="rp-btn rp-btn-secondary">
            View projects
          </a>
        </div>
      </div>

      <a href="#about" className="rp-scroll-hint" aria-label="Scroll down">
        <span className="rp-scroll-arrow" />
      </a>
    </section>
  );
}
