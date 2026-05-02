import ImageCard    from '../bits/ImageCard.jsx';
import ScrollReveal  from '../bits/ScrollReveal.jsx';
import GradientText  from '../bits/GradientText.jsx';
import Prism         from '../bits/Prism.jsx';

// Sample items — swap `image` for any URL, or remove it to use `gradient`.
const ITEMS = [
  {
    title:       'Mountain Vista',
    image:       'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
    description: 'The crisp alpine air and vast open skies above the treeline. '
               + 'This shot was taken at golden hour when the ridges cast long '
               + 'violet shadows across a sea of clouds below.',
    meta:        'Landscape · Patagonia',
    chips:       ['Photography', 'Nature', 'Golden Hour'],
  },
  {
    title:       'Ocean Waves',
    image:       'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=900&q=80',
    description: 'The rhythmic pulse of the ocean, where turquoise waters meet '
               + 'golden shores. Feel the power and serenity of the endless sea '
               + 'as waves crash against ancient rocks.',
    meta:        'Seascape · Pacific Coast',
    chips:       ['Photography', 'Ocean', 'Long Exposure'],
  },
  {
    title:       'Desert Dunes',
    image:       'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=900&q=80',
    description: 'Sculpted by wind over millennia, the dunes rise and fall like '
               + 'a frozen ocean. At sunrise the slipfaces glow amber and the '
               + 'shadows are razor-sharp.',
    meta:        'Landscape · Sahara',
    chips:       ['Photography', 'Desert', 'Aerial'],
  },
  {
    title:       'Northern Lights',
    image:       'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=900&q=80',
    description: 'Curtains of green and violet plasma dance above the Arctic '
               + 'horizon on a windless February night. The lake surface '
               + 'mirrors every ripple of light.',
    meta:        'Astrophotography · Iceland',
    chips:       ['Photography', 'Aurora', 'Night Sky'],
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="rp-section">
      <Prism scale={3.1} glow={0.8} bloom={0.8} noise={0.4} timeScale={0.35} />
      <div className="rp-container">
        <ScrollReveal>
          <h2 className="rp-section-title">
            <GradientText colors={['#22c55e', '#86efac', '#4ade80', '#22c55e']} animationSpeed={9}>
              Gallery
            </GradientText>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 32, marginTop: -32 }}>
            Tap any card to expand.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <ImageCard items={ITEMS} />
        </ScrollReveal>
      </div>
    </section>
  );
}
