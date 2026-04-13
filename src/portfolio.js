/* portfolio.js – Alejandro Balea Moreno */
(function () {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-links a[data-section]');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.nav-hamburger');

  // Nav scroll effect + active link
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);

    let current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    links.forEach(function (a) {
      a.classList.toggle('active', a.dataset.section === current);
    });
  }, { passive: true });

  // Intersection Observer for reveal elements
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  // Mobile hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }
}());
