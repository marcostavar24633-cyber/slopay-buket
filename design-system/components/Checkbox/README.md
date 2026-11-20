# Checkbox

A 20px box with `radius-md` corners and a text label, used for consent and order options.

Unchecked: 2px border of `color-ink` at 25% on `color-surface`. Checked: fill and border `color-honey`, check mark `color-onaccent` (lucide Check, stroke 3). Label 14px `color-ink-soft`, 12px gap, box aligned to the first line.

Consumer provides `checked`, `onChange(boolean)` and the label as children; `dark` for graphite blocks (label white at 70%).

_Static rendition hand-written from `src/components/ui/checkbox.tsx` (classes in `components/bundle.css`); the site's React component is not bundled here._
