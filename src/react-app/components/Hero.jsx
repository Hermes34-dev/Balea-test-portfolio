import FloatingLines from '../bits/FloatingLines.jsx';
import BlurText      from '../bits/BlurText.jsx';
import GradientText  from '../bits/GradientText.jsx';
import ShinyText     from '../bits/ShinyText.jsx';

export default function Hero() {
  return (
    <section id="hero" className="rp-hero">
      <FloatingLines
        linesGradient={['#061a0d', '#0b4524', '#22c55e', '#4ade80']}
        enabledWaves={['middle', 'bottom']}
        lineCount={10}
        lineDistance={6}
        animationSpeed={0.7}
        interactive
        bendRadius={3.0}
        bendStrength={-0.6}
        mouseDamping={0.04}
        parallax
        parallaxStrength={0.12}
        mixBlendMode="screen"
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
