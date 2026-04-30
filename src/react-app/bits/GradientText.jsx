import './GradientText.css';

export default function GradientText({
  children,
  colors        = ['#22c55e', '#86efac', '#4ade80', '#22c55e'],
  animationSpeed = 8,
  showBorder    = false,
  className     = '',
}) {
  const gradient = `linear-gradient(90deg, ${colors.join(', ')})`;
  return (
    <span
      className={`gradient-text ${showBorder ? 'with-border' : ''} ${className}`}
      style={{
        '--grad': gradient,
        '--speed': `${animationSpeed}s`,
      }}
    >
      {children}
    </span>
  );
}
