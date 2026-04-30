import { useEffect, useRef, useState } from 'react';

const TRANSFORMS = {
  up:    'translateY(36px)',
  down:  'translateY(-36px)',
  left:  'translateX(-36px)',
  right: 'translateX(36px)',
  none:  'none',
};

export default function ScrollReveal({
  children,
  className  = '',
  direction  = 'up',
  delay      = 0,
  threshold  = 0.12,
  style      = {},
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'none' : (TRANSFORMS[direction] ?? TRANSFORMS.up),
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
