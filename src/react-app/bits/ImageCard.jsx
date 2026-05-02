import { useState, useEffect, useRef } from 'react';
import './ImageCard.css';

export default function ImageCard({ items = [] }) {
  const [open,    setOpen]    = useState(null);
  const [visible, setVisible] = useState(false);

  const openModal  = (item) => { setOpen(item); requestAnimationFrame(() => setVisible(true)); };
  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setOpen(null), 320);
  };

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className="ic-list">
        {items.map((item, i) => (
          <div
            key={i}
            className="ic-card"
            onClick={() => openModal(item)}
            role="button"
            tabIndex={0}
            aria-label={`Open ${item.title}`}
            onKeyDown={e => e.key === 'Enter' && openModal(item)}
          >
            <div className="ic-thumb">
              {item.image
                ? <img src={item.image} alt={item.title} loading="lazy" />
                : <div className="ic-thumb-fill" style={{ background: item.gradient }} />
              }
            </div>
            <div className="ic-footer">
              <span className="ic-footer-title">{item.title}</span>
              <span className="ic-plus" aria-hidden="true">＋</span>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div
          className={`ic-backdrop${visible ? ' ic-visible' : ''}`}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
        >
          <div
            className={`ic-modal${visible ? ' ic-visible' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Image hero ── */}
            <div className="ic-modal-hero">
              {open.image
                ? <img src={open.image} alt={open.title} />
                : <div className="ic-modal-hero-fill" style={{ background: open.gradient }} />
              }
              <div className="ic-modal-hero-overlay">
                <h2 className="ic-modal-title">{open.title}</h2>
              </div>
              <button
                className="ic-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >×</button>
            </div>

            {/* ── Body ── */}
            <div className="ic-modal-body">
              {open.description && <p className="ic-modal-desc">{open.description}</p>}
              {open.meta && <p className="ic-modal-meta">{open.meta}</p>}
              {open.chips && open.chips.length > 0 && (
                <div className="ic-modal-chips">
                  {open.chips.map(c => <span key={c}>{c}</span>)}
                </div>
              )}
              {open.link && (
                <a
                  href={open.link}
                  target="_blank"
                  rel="noopener"
                  className="ic-modal-btn"
                  onClick={e => e.stopPropagation()}
                >
                  {open.linkLabel ?? 'Learn More'} ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
