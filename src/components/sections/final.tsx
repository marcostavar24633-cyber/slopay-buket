import { useState } from 'react'
import { MapPin, Phone } from 'lucide-react'
import { TelegramIcon, VkIcon, MaxIcon } from '@/components/shared/icons'
import { Logo } from '@/components/sections/header'
import { SITE, MSG, tgLink, maxLink, legalLine } from '@/lib/config'

export function Footer() {
  const [map, setMap] = useState(false)
  return (
    <footer className="bg-graphite pb-8 pt-14 text-white/70">
      <div className="container-x grid gap-10 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]">
        <div>
          <Logo light />
          <a href={SITE.phoneHref} className="mt-6 flex min-h-11 items-center gap-2 text-2xl font-extrabold text-white">
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
          {legalLine() && <p className="pt-3 text-[12px] leading-relaxed text-white/70">{legalLine()}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
            <a id="privacy" href="/privacy/" className="inline-flex min-h-11 items-center underline underline-offset-2">Политика конфиденциальности</a>
            <a href="/oferta/" className="inline-flex min-h-11 items-center underline underline-offset-2">Публичная оферта</a>
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
      <p className="container-x mt-10 border-t border-white/10 pt-6 text-[12px] text-white/65">
        © 2023–{new Date().getFullYear()} {SITE.brand} — съедобные букеты с доставкой в Ульяновске. Ягодные, мясные и раковые букеты, сухофрукты, сладкие боксы и корпоративные подарки.
      </p>
    </footer>
  )
}
