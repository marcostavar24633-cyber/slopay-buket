# MessengerButtons

The site's only way to order: MAX and Telegram buttons that open the master's chat with a prepared message.

Two `Button`s, `max` then `tg`, size `lg` by default (`md` optional), stacked or side by side (`row`, labels shorten to «MAX» / «Telegram»), 12px gap. Under them a 12.5px `color-muted` helper line explains what happens to the text and changes to «✓ Готово…» after a click. Clicking fires the `max_click` / `tg_click` goal and copies the message.

Consumer provides `text` (the order message), `from` (analytics source), optional `onBefore` validation. MAX always comes first.

_Static rendition hand-written from `src/components/shared/messenger-buttons.tsx` (classes in `components/bundle.css`); the site's React component is not bundled here._
