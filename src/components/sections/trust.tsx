import { SectionTitle } from '@/components/shared/section-title'
import { MessengerButtons } from '@/components/shared/messenger-buttons'
import { MSG } from '@/lib/config'
import { FAQ_DATA } from '@/lib/content'

/** Вопросы — из админки (content/faq.json). Первыми — три самых частых возражения. */
const FAQ = FAQ_DATA

/** Разметка FAQPage для поисковиков (сниппеты с вопросами). */
const FAQ_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

export function Faq() {
  return (
    <section id="faq" className="bg-surface py-14 md:py-24">
      <div className="container-x grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionTitle eyebrow="Вопросы и ответы" title={<>Коротко о главном: <span className="italic text-gold">хранение, фото, сроки</span></>} sub="Собрали вопросы из реальных переписок с клиентами." />
          <div className="hidden rounded-3xl bg-cream p-6 lg:block">
            <p className="font-display text-[22px] font-semibold leading-tight">Не нашли ответ?</p>
            <p className="mt-1 text-[14px] text-ink-soft">Спросите — ответим за 5 минут.</p>
            <MessengerButtons row size="md" text={MSG.faq} from="faq" className="mt-4" />
          </div>
        </div>
        <div>
          {/* ответы всегда в HTML (details/summary) — видны поисковикам и без скриптов */}
          <div className="flex flex-col gap-3">
            {FAQ.map((f, i) => (
              <details key={f.q} open={i === 0} className="group rounded-2xl border border-line bg-cream px-5 open:pb-4">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[16px] font-bold leading-snug [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-xl text-honey-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_LD }} />
          <div className="mt-6 hidden rounded-3xl bg-cream p-5 md:block lg:hidden">
            <p className="font-bold">Не нашли ответ? Спросите — ответим за 5 минут</p>
            <MessengerButtons row size="md" text={MSG.faq} from="faq" className="mt-3" />
          </div>
        </div>
      </div>
    </section>
  )
}
