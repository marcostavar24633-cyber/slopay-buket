# StatusPill

A live "we're taking orders" indicator with a pulsing green dot, shown in the header and hero.

13px semibold `color-ink-soft`, an 8px Tailwind green-500 dot with a 2s pulse ring, 8px gap. Full text appends the opening hours from site config («Принимаем заказы · ежедневно 8:00–21:00»); `compact` shows only «Принимаем заказы».

Consumer provides nothing but `compact`; the hours come from `SITE.hours`.

_Static rendition hand-written from `src/components/shared/status-pill.tsx` (classes in `components/bundle.css`); the site's React component is not bundled here._
