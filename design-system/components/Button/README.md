# Button

The pill-shaped action used everywhere on the site; `primary` (metallic gold) is the one call to action per view.

**Variants** — `primary` gold gradient (`bg-gold`) with `color-onaccent` bold text and `shadow-cta`; `outline` hairline gold on a 40% scrim, for the second action next to primary (hero «Подобрать букет за 2 минуты»); `dark` scrim fill with `color-honey-600` text; `max` / `tg` messenger fills (`color-max`, `color-tg`, white text); `tgOutline` Telegram on surface; `ghost` nav-level; `link` underlined in `color-honey`; `light` `color-surface` fill for actions on photos and dark blocks.

**Sizes** — `sm` 40px / 14px, `md` 48px / 15px (default), `lg` 56px / 16px, `icon` 44×44. Every button is `radius-full`.

**Behaviour** — hover/focus/press runs the gold border (`.run-border-out`) around the button; press scales to 0.98; focus adds a 4px ring of `color-honey` at 40%; disabled is 50% opacity.

**Consumer provides** — the label (sentence case, a verb: «Заказать», «Написать в MAX»), an optional 20px icon before it, `asChild` to render a link.

Do: one `primary` per screen area; pair `primary` + `outline`. Don't: put white text on `color-honey`; use `tg` for long labels on light backgrounds (white on `#229ed9` is 3.0:1).

_Static rendition hand-written from `src/components/ui/button.tsx` (classes in `components/bundle.css`); the site's React component is not bundled here._
