«Слопай букет» is a food-floristry studio in Ulyanovsk: edible bouquets of strawberries, meat, crayfish, dried fruit and sweets, ordered in one message through MAX or Telegram. The site is black and metallic gold by default — a jeweller's box for food — with a warm peach, gold and red light theme.

## Content fundamentals

- Write in Russian, addressing the customer as **«вы»**; the studio speaks as **«мы»** («Закупаем ягоды… и присылаем фото готового букета до отправки»).
- Lead with the concrete promise: a time, a number, a guarantee — «Подобрать букет за 2 минуты», «Ответим в течение 15 минут», «Рейтинг 5,0 на Авито, 107 отзывов», «От 1 700 ₽».
- Headlines are search-plain first, then emotional; the accent half goes in `.text-gold`: «Съедобные букеты в Ульяновске — *подарок, который не завянет*».
- Sentence case everywhere; only `eyebrow` is uppercase. Buttons start with a verb: «Заказать в 1 сообщение», «Написать в Telegram», «Рассчитать корпоративный заказ».
- FAQ questions are phrased the way customers ask them: «Будет как на фото?», «Успеете к сегодня?». Answers start with «Да.» or a direct fact.
- Prices as «1 700 ₽» (thin-space thousands, ₽ after); times as «8:00–21:00», en dash in ranges; «·» separates short facts.
- Emoji appear sparingly as tab markers (🎄 Новый год) and the ✓ confirmation; never as decoration in body copy.

## Visual foundations

**Colour.** Dark theme first: page `color-cream` (#0a0908), cards `color-surface`, deep panels `color-panel`. Text is `color-ink`, secondary `color-ink-soft`, tertiary `color-muted`. Gold `color-honey` is the single accent — CTA fills, selected chips, checked boxes — and `color-honey-600` is the accent for text (eyebrows, figures) and the focus ring. Borders are hairlines in `color-line` (gold at 16%). In the light theme the same names become peach grounds, wine-brown ink and red accent text (`color-honey-600` = #b8262c); dark blocks (`color-graphite`) turn wine red. `color-berry` marks sale and love, `color-leaf` freshness; `color-max` and `color-tg` belong only to their messenger buttons.

**Gold finish.** Gold is metallic, not flat: primary buttons use the `.bg-gold` 135° gradient that slides on hover, accent words use the animated `.text-gold` gradient (red-to-gold in light theme), and hovered buttons, chips and cards get the `.run-border` — a conic gold highlight running round the edge. These gradients live in `components/bundle.css`; never replace them with a flat `color-honey` on headings.

**Type.** Two families: `display` (Playfair Display, 600, −0.015em) for headings, card titles and italic `quote`s; `sans` (Manrope) for everything else. Section H2 is `display-section` (48px, 30px on phones); the hero H1 grows 29 → 58px. Body is `body` 16px, card text `body-sm` 15px, UI labels `label` 14px semibold, meta `caption` 13px. Big numbers use `stat` (800, tight). The `eyebrow` kicker is 12px bold uppercase, 0.14em tracking.

**Shape and space.** Every button and chip is a pill (`radius-full`). Inputs, accordion items and standard cards use `radius-2xl` (20px); large product cards, dialogs and sheets `radius-3xl` (28px). The page column is `container-max` 1240px with 16px sides on phones and 32px from 768px. Spacing follows Tailwind's 4px unit; section titles sit 32/48px above their content.

**Depth.** Cards rest on `shadow-soft` and rise to `shadow-lift` on hover — a deep drop with a faint gold halo. Primary buttons glow with `shadow-cta`; MAX with `shadow-max`. Light theme shadows are warm red-brown, never grey.

**Imagery and motion.** Real photos of the studio's own bouquets (WebP), dark food video behind the hero under `video-scrim`, slow aurora glows (`aurora-1`, `aurora-2`), floating food icons (`color-bgicon`) and sparkle dust (`color-dust`). Sections fade in (BlurFade); theme switching reveals as a circle from the toggle. All motion collapses under `prefers-reduced-motion`.

**States.** Focus: 4px ring of `color-honey` at 25–40%, or `color-ring` on inputs. Press: scale 0.98. Disabled: 50% opacity. Selected: gold fill with `color-onaccent` text.

**Contrast notes.** Taken as the source has them: light-theme `color-muted` is 4.1–4.4:1 on its grounds and `color-river-fg` 4.15:1 — keep both to 15px+ or non-essential text; white on `color-tg` is 3.0:1; `color-honey` is a fill, never text, in the light theme (2.4:1).

## Iconography

UI icons are **lucide-react** (Check, Plus, arrows; 16–20px, stroke 2, colour inherited). Messenger marks — MAX, Telegram, VK — are the site's own 24px single-path SVGs, in **Icons**; on the site they take the button's text colour (white). The logo is the round emblem in **Logos**: a cream disc with a craft-paper cone of strawberries, citrus, salami and shrimp, «ФУДФЛОРИСТИКА» above and «СЪЕДОБНЫЕ БУКЕТЫ» below. Use it whole; never recolour it or set it on gold.

## Not synced

From `marcostavar24633-cyber/slopay-buket` at `main@dcc3f27` (`src/index.css`, `src/components/ui`, `src/components/shared`). Not brought in:

- **Font files** — the site gets Manrope and Playfair Display from the `@fontsource-variable` npm packages, which are not committed; this system names them as Google Fonts instead.
- **Components were not built** — no packages could be installed, so each card is a static HTML rendition in `bundle.css`. Hand-written from: Button `src/components/ui/button.tsx` · Input, PhoneInput, Label `src/components/ui/input.tsx` · Checkbox `src/components/ui/checkbox.tsx` · Chips `src/components/ui/chips.tsx` · Accordion `src/components/ui/accordion.tsx` · SectionTitle `src/components/shared/section-title.tsx` · MessengerButtons `src/components/shared/messenger-buttons.tsx` · StatusPill `src/components/shared/status-pill.tsx`.
- Not carried: Dialog, Sheet, ThemeToggle, CookieNotice, SeasonBar, the Magic UI / Aceternity effects (Marquee, NumberTicker, BlurFade, Spotlight, Parallax) and the page sections.
- **Skipped values** — keyframe animations (marquee, shimmer, spotlight, aurora, twinkle, theme reveal) and the gold gradients, which are not single values; the gradients are kept in `bundle.css`. Spacing steps and `radius-md`/`radius-full` are Tailwind v4 defaults the site relies on, not custom tokens.
