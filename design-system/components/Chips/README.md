# Chips

A radio group of pills for one-of-many choices — quiz answers, recipient tabs, budget.

Each chip is 44px high, `radius-full`, 14px semibold. Idle: `color-line` border on `color-surface`, `color-ink` text; hover border `color-ink` at 40%. Selected: `color-honey` fill and border, `color-onaccent` text. `dark` variant for graphite blocks: white at 5% fill and 15% border, text white at 85%. Chips wrap with an 8px gap and run the gold border on hover.

Consumer provides `options` ({key, label}), `value`, `onChange`, and an `ariaLabel` for the group.

_Static rendition hand-written from `src/components/ui/chips.tsx` (classes in `components/bundle.css`); the site's React component is not bundled here._
