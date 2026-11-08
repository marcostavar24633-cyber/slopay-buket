import { SectionTitle } from '@/components/shared/section-title'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { MessengerButtons } from '@/components/shared/messenger-buttons'
import { MSG } from '@/lib/config'

const FAQ = [
  {
    q: 'Сколько букет может стоять без холодильника?',
    a: 'Ягодный букет — до 4 часов при комнатной температуре, мясной, сырный и с раками — до 5 часов в защитной плёнке. Дальше — в холодильник, там всё хранится до 24 часов. Сухофрукты и сладкие боксы холодильник не требуют.',
  },
  {
    q: 'Букет правда такого размера, как на фото?',
    a: 'Да. Все фото на сайте — реальные работы мастерской, размер и состав согласуем с вами заранее. Перед отправкой мы присылаем фото именно вашего букета.',
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
  { q: 'Можно сделать сюрприз анонимно?', a: 'Да. Курьер не скажет, от кого букет, пока вы не разрешите, и вручит молча или с вашей фразой.' },
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
            <MessengerButtons row size="md" text={MSG.faq} from="faq" className="mt-4" />
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
            <MessengerButtons row size="md" text={MSG.faq} from="faq" className="mt-3" />
          </div>
        </div>
      </div>
    </section>
  )
}
