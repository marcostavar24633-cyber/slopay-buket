import { ArrowRight, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE } from '@/lib/config'
import { goal } from '@/lib/analytics'

/** Тизер для компаний на главной: одна строка и кнопка на отдельную страницу /corporate/. */
export function CorporateTeaser() {
  return (
    <section id="corporate" className="py-10 md:py-14">
      <div className="container-x">
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-honey/25 bg-panel p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <p className="flex items-start gap-3 text-[16px] font-semibold leading-snug md:text-[18px]">
            <Briefcase className="mt-0.5 h-6 w-6 shrink-0 text-honey" />
            <span>
              <b className="font-extrabold">Подарки сотрудникам и партнёрам:</b> коробочки в едином стиле, скидка до 15% за объём, новогодние заказы — до {SITE.corpDeadline}.
            </span>
          </p>
          <Button size="lg" className="w-full shrink-0 md:w-auto" asChild>
            <a href={import.meta.env.BASE_URL + 'corporate/'} onClick={() => goal('corp_teaser_click')}>
              Корпоративные подарки <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
