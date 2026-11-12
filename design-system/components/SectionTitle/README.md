# SectionTitle

The heading block that opens every section: eyebrow, display H2, optional subtitle.

Eyebrow: `eyebrow` style (12px, 700, 0.14em, uppercase, `color-honey-600`), 12px above. H2: `h-display` Playfair 600, 30px on phones, 48px from md. Subtitle: 16px → 18px `color-ink-soft`, 16px below the title. Block max width 768px, 32px (48px from md) bottom margin; `center` centres it; `dark` switches to white title, white-65% subtitle and `color-honey` eyebrow. Fades in with BlurFade.

Consumer provides `eyebrow`, `title` (wrap 1–3 key words in `.text-gold` for the accent), `sub`. Titles can be overridden from the admin.

_Static rendition hand-written from `src/components/shared/section-title.tsx` (classes in `components/bundle.css`); the site's React component is not bundled here._
