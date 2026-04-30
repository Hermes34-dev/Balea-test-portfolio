import Nav        from './components/Nav.jsx';
import Hero       from './components/Hero.jsx';
import About      from './components/About.jsx';
import Experience from './components/Experience.jsx';
import Projects   from './components/Projects.jsx';
import Skills     from './components/Skills.jsx';
import Contact    from './components/Contact.jsx';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <footer className="rp-footer">
        <div className="rp-footer-inner">
          <span>© 2025 Alejandro Balea Moreno</span>
          <div className="rp-footer-links">
            <a href="/">3D Scene →</a>
            <a href="/portfolio.html">2D Classic →</a>
          </div>
        </div>
      </footer>
    </>
  );
}
