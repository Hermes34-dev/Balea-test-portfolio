import { useRef } from 'react';
import './SpotlightCard.css';

export default function SpotlightCard({
  children,
  className    = '',
  spotlightColor = 'rgba(34, 197, 94, 0.15)',
  onClick,
}) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--sx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--sy', `${e.clientY - rect.top}px`);
    card.style.setProperty('--sc', spotlightColor);
  };

  return (
    <div
      ref={ref}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <div className="spotlight-overlay" aria-hidden />
      {children}
    </div>
  );
}
