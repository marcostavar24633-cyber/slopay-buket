# Input

Single-line text field, 48px tall with `radius-2xl` corners, used in the quiz, corporate calculator and order forms.

`border` `color-line`, fill `color-surface`, text 16px `color-ink`, placeholder `color-muted` at 70%. Focus: border `color-honey-600` and a 4px `color-honey` ring at 25%. On dark blocks (`dark` prop) it turns to white at 5% fill, white at 15% border, focus border `color-honey`.

**PhoneInput** wraps it with `type="tel"`, placeholder `+7 (___) ___-__-__`, inserts `+7 (` on focus and masks as the user types. **Label** sits above: 14px semibold `color-ink-soft`, 6px gap.

Consumer provides: `value`, `onChange`, a `Label` with `htmlFor`, and `dark` when the form is on `color-graphite`.

_Static rendition hand-written from `src/components/ui/input.tsx` (classes in `components/bundle.css`); the site's React component is not bundled here._
