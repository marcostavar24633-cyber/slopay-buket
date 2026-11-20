# Accordion

The FAQ item: a question row that opens to a short answer (Radix Accordion).

Item: `radius-2xl`, `color-line` border, `color-surface` fill, gains `shadow-soft` when open. Trigger: 15px bold (16px from md), padding 20px (24px sides from md), a 32px `color-cream-2` disc with a plus that rotates 45° and turns `color-honey` when open. Answer: 15px / 1.625 `color-ink-soft`. Opens with a 200ms height animation.

Consumer provides `AccordionItem value`, the question as `AccordionTrigger` children, the answer as `AccordionContent`. Write questions the way a customer asks them («Успеете к сегодня?»).

_Static rendition hand-written from `src/components/ui/accordion.tsx` (classes in `components/bundle.css`); the site's React component is not bundled here._
