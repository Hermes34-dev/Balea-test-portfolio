import './ShinyText.css';

export default function ShinyText({ text, disabled = false, speed = 5, className = '' }) {
  return (
    <span
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={{ '--speed': `${speed}s` }}
    >
      {text}
    </span>
  );
}
