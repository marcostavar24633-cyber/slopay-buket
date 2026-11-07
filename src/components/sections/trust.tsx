import { Camera, Clock, Leaf, ShieldCheck } from 'lucide-react'
import { SectionTitle } from '@/components/shared/section-title'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { MaxIcon } from '@/components/shared/icons'
import { MSG, maxLink } from '@/lib/config'
import { goal } from '@/lib/analytics'

const GUARANTEES = [
  { icon: Camera, t: 'Фото до отправки', d: 'Пришлём фото готового букета перед отправкой — вы видите, что получит человек.' },
  { icon: Leaf, t: 'Гарантия свежести', d: 'Если в течение 2 часов после вручения пришлёте фото и мы подтвердим, что продукт был несвежим, — сделаем скидку.' },
  { icon: Clock, t: 'Доставим вовремя', d: 'Привезём к согласованному времени. Если задержались по нашей вине — доставку оплатим сами.' },
  { icon: ShieldCheck, t: 'Безопасно для аллергиков', d: 'Уберём любой ингредиент и соберём на отдельной чистой поверхности.' },
]

export function Guarantees() {
  return (
    <section className="py-14 md:py-24">
      <div className="container-x">
        <SectionTitle eyebrow="Гарантии" title={<>Мы отвечаем <span className="italic text-gold">за каждый букет</span></>} center />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((g, i) => (
            <BlurFade key={g.t} delay={i * 0.06} className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-honey bg-honey-100">
                <g.icon className="h-8 w-8 text-honey-600" />
              </div>
              <h3 className="mt-5 text-[18px] font-extrabold">{g.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{g.d}</p>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQ = [
  {
    q: 'Сколько букет может стоять без холодильника?',
    a: 'Ягодный букет — до 4 часов при комнатной температуре, мясной, сырный и с раками — до 5 часов в защитной плёнке. Дальше — в холодильник, там всё хранится до 24 часов. Сухофрукты и сладкие боксы холодильник не требуют.',
  },
  {
    q: 'Букет правда такого размера, как на фото?',
    a: 'Да. Все фото на сайте — реальные работы мастерской, в карточках указаны размеры. Перед отправкой мы присылаем фото именно вашего букета.',
  },
  { q: 'Можно заменить ингредиенты?', a: 'Да, любой. Заменить дорблю на маасдам, убрать орехи, добавить больше клубники — цена пересчитывается честно, по фактическому составу.' },
  {
    q: 'За сколько нужно заказывать?',
    a: 'Лучше за 1–2 дня, в отдельных случаях соберём день в день. Перед Новым годом, 14 и 23 февраля, 8 Марта бронируйте заранее: даты быстро заканчиваются.',
  },
  {
    q: 'Можно добавить алкоголь?',
    a: 'Дистанционная продажа алкоголя в России запрещена, поэтому мы его не продаём. Можем вплести в букет бутылку, которую вы привезёте сами в мастерскую.',
  },
  { q: 'Можно сделать сюрприз анонимно?', a: 'Да. Курьер не скажет, от кого букет, пока вы не разрешите. Можно добавить открытку без подписи или с загадкой.' },
  {
    q: 'Что если получателя не окажется дома?',
    a: 'Курьер позвонит получателю, затем вам. Ждём до 15 минут бесплатно. Дальше — оставим соседям/на ресепшене с вашего согласия или вернём в мастерскую и привезём повторно (оплачивается только повторная доставка).',
  },
  {
    q: 'Как оплатить? Нужна предоплата?',
    a: 'Перевод по СБП или картой онлайн — после того, как согласуем состав. Для брони даты — предоплата 50%. Корпоративные заказы — тоже предоплата 50%.',
  },
  { q: 'Работаете ли в выходные и рано утром?', a: 'Работаем каждый день, 8:00–21:00, включая выходные и праздники. Утреннюю доставку ко дню рождения тоже делаем — договоримся о времени заранее.' },
]

export function Faq() {
  return (
    <section id="faq" className="bg-surface py-14 md:py-24">
      <div className="container-x grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionTitle eyebrow="Вопросы и ответы" title={<>Отвечаем <span className="italic text-gold">честно</span></>} sub="Собрали вопросы из реальных переписок с клиентами." />
          <div className="hidden rounded-3xl bg-cream p-6 lg:block">
            <p className="font-display text-[22px] font-semibold leading-tight">Не нашли ответ?</p>
            <p className="mt-1 text-[14px] text-ink-soft">Спросите — ответим за 5 минут.</p>
            <Button variant="max" className="mt-4" asChild>
              <a href={maxLink(MSG.faq)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'faq' })}>
                <MaxIcon className="h-5 w-5" /> Задать вопрос в MAX
              </a>
            </Button>
          </div>
        </div>
        <div>
          <Accordion type="single" collapsible defaultValue="item-0" className="flex flex-col gap-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-6 rounded-3xl bg-cream p-5 lg:hidden">
            <p className="font-bold">Не нашли ответ? Спросите — ответим за 5 минут</p>
            <Button variant="max" className="mt-3 w-full" asChild>
              <a href={maxLink(MSG.faq)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'faq' })}>
                <MaxIcon className="h-5 w-5" /> Задать вопрос в MAX
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
