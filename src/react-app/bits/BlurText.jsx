import { useEffect, useRef, useState } from 'react';
import './BlurText.css';

export default function BlurText({
  text        = '',
  delay       = 120,
  animateBy   = 'words',
  direction   = 'top',
  className   = '',
  onAnimationComplete,
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tokens = animateBy === 'words'
    ? text.split(' ').map((w, i, arr) => w + (i < arr.length - 1 ? ' ' : ''))
    : text.split('');

  return (
    <span ref={ref} className={`blur-text ${className}`} aria-label={text}>
      {tokens.map((token, i) => (
        <span
          key={i}
          className={`blur-token dir-${direction}${inView ? ' blur-in' : ''}`}
          style={{ animationDelay: `${i * delay}ms` }}
          onAnimationEnd={i === tokens.length - 1 ? onAnimationComplete : undefined}
          aria-hidden
        >
          {token}
        </span>
      ))}
    </span>
  );
}
