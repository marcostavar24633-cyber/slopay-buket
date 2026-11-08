import { useState } from 'react'
import { ParallaxImage, Parallax } from '@/components/aceternity/parallax'
import { CalendarCheck, MapPin, Phone } from 'lucide-react'
import { BlurFade } from '@/components/magicui/blur-fade'
import { TelegramIcon, VkIcon, MaxIcon } from '@/components/shared/icons'
import { MessengerButtons } from '@/components/shared/messenger-buttons'
import { Logo } from '@/components/sections/header'
import { SITE, MSG, tgLink, maxLink, legalLine } from '@/lib/config'
import { goal } from '@/lib/analytics'

export function FinalOffer() {
  return (
    <section id="order" className="relative overflow-hidden border-y border-honey/20 bg-panel/85 py-14 md:py-24">
      <div aria-hidden className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-honey/20 blur-[120px]" />
      <div aria-hidden className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-honey/10 blur-[120px]" />
      <div className="container-x relative grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <BlurFade className="relative">
          <ParallaxImage src="/img/real/berry/yag-21.webp" alt="Сердце из клубники и голубики — работа мастерской" className="aspect-[4/5] max-h-[620px] rounded-[32px] shadow-lift ring-1 ring-honey/30" />
          <Parallax speed={-0.35} className="absolute left-4 top-4">
          <div className="rounded-2xl border border-honey/40 bg-scrim/80 px-4 py-3 shadow-lift backdrop-blur">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-muted">
              <CalendarCheck className="h-3.5 w-3.5" /> Лучше заказать заранее
            </p>
            <p className="text-gold text-[26px] font-extrabold leading-tight tracking-tight">за 1–2 дня</p>
          </div>
          </Parallax>
        </BlurFade>
        <BlurFade delay={0.1}>
          <h2 className="h-display text-[32px] md:text-[52px]">
            Удивите близких — <span className="italic text-gold">подарком, который съедят с удовольствием</span>
          </h2>
          <p className="mt-4 text-[16px] font-medium text-ink/75 md:text-lg">Напишите нам — подберём букет под повод и бюджет.</p>
          <div className="mt-6 rounded-3xl border border-honey/25 bg-surface/90 p-5 shadow-lift backdrop-blur md:p-6">
            <MessengerButtons text={MSG.final} from="final" />
            <p className="mt-4 text-center text-[13px] text-muted">
              Или позвоните:{' '}
              <a href={SITE.phoneHref} onClick={() => goal('phone_click', { from: 'final' })} className="font-extrabold text-ink underline decoration-2 underline-offset-4">
                {SITE.phoneDisplay}
              </a>
            </p>
            <p className="mt-1 text-center text-[13px] text-muted">Оплата только после согласования</p>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}

export function Footer() {
  const [map, setMap] = useState(false)
  return (
    <footer className="bg-graphite pb-8 pt-14 text-white/70">
      <div className="container-x grid gap-10 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]">
        <div>
          <Logo light />
          <a href={SITE.phoneHref} className="mt-6 flex items-center gap-2 text-2xl font-extrabold text-white">
            <Phone className="h-5 w-5" /> {SITE.phoneDisplay}
          </a>
          <div className="mt-4 flex gap-2">
            {[
              { href: maxLink(MSG.header), icon: MaxIcon, label: 'MAX', cls: 'bg-max' },
              { href: tgLink(MSG.header), icon: TelegramIcon, label: 'Telegram', cls: 'bg-tg' },
              ...(SITE.vk ? [{ href: SITE.vk, icon: VkIcon, label: 'ВКонтакте', cls: 'bg-white/10' }] : []),
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener" aria-label={s.label} className={`run-border grid h-11 w-11 place-items-center rounded-full text-white ${s.cls}`}>
                <s.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-3 text-[14px]">
          <p className="flex items-start gap-2 text-white">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Ульяновск, {SITE.address}
          </p>
          <p>{SITE.hours}</p>
          <p>Самовывоз из мастерской — бесплатно</p>
          {legalLine() && <p className="pt-3 text-[12px] leading-relaxed text-white/45">{legalLine()}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
            <a id="privacy" href="/privacy/" className="underline underline-offset-2">Политика конфиденциальности</a>
            <a href="/oferta/" className="underline underline-offset-2">Публичная оферта</a>
          </div>
        </div>
        <div className="relative h-56 overflow-hidden rounded-3xl bg-graphite-2 md:col-span-2 lg:col-span-1">
          {map ? (
            <iframe
              title="Мастерская «Слопай букет» на Яндекс Картах"
              src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(`Ульяновск, ${SITE.address.replace(", Новый город", "")}`)}&z=16`}
              className="h-full w-full border-0"
              loading="lazy"
            />
          ) : (
            <button onClick={() => setMap(true)} className="grid h-full w-full cursor-pointer place-items-center bg-[radial-gradient(circle_at_60%_40%,rgb(242_169_59/0.2),transparent_60%)] text-[14px] font-bold text-white">
              <span className="flex flex-col items-center gap-2">
                <MapPin className="h-8 w-8 text-honey" /> Показать на Яндекс Картах
              </span>
            </button>
          )}
        </div>
      </div>
      <p className="container-x mt-10 border-t border-white/10 pt-6 text-[12px] text-white/40">
        © 2023–2026 Слопай букет — съедобные букеты с доставкой в Ульяновске. Ягодные, мясные и раковые букеты, сухофрукты, сладкие боксы и корпоративные подарки.
      </p>
    </footer>
  )
}
