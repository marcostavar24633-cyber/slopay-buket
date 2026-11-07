import { useState } from 'react'
import { ParallaxImage } from '@/components/aceternity/parallax'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Chips } from '@/components/ui/chips'
import { PhoneInput } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Consent } from '@/components/shared/consent'
import { SectionTitle } from '@/components/shared/section-title'
import { BorderBeam } from '@/components/magicui/border-beam'
import { SITE } from '@/lib/config'
import { isPhoneValid } from '@/lib/phone'
import { submitLead } from '@/lib/leads'
import { goal } from '@/lib/analytics'
import { scrollToId, useUI } from '@/lib/ui-store'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    key: 'to',
    q: 'Кому дарим?',
    options: [
      { v: 'Девушке / жене', e: '👩' },
      { v: 'Мужчине', e: '🧔' },
      { v: 'Маме', e: '💐' },
      { v: 'Коллеге / руководителю', e: '💼' },
      { v: 'Ребёнку', e: '🧸' },
      { v: 'Команде (больше 5 шт.)', e: '👥' },
    ],
  },
  {
    key: 'occasion',
    q: 'Какой повод?',
    options: [
      { v: 'День рождения', e: '🎂' },
      { v: 'Праздник (Новый год, 8 Марта, 23 Февраля)', e: '🎄' },
      { v: 'Извиниться', e: '🥺' },
      { v: 'Без повода', e: '✨' },
      { v: 'Свидание', e: '❤️' },
    ],
  },
  {
    key: 'taste',
    q: 'Что любит получатель?',
    options: [
      { v: 'Сладкое', e: '🍓' },
      { v: 'Мясо и сыр', e: '🧀' },
      { v: 'Фрукты', e: '🍍' },
      { v: 'Не знаю, на ваш вкус', e: '🤷' },
    ],
  },
  {
    key: 'budget',
    q: 'Какой бюджет?',
    options: [
      { v: 'до 3 000 ₽', e: '💛' },
      { v: '3 000 – 5 000 ₽', e: '🧡' },
      { v: '5 000 – 8 000 ₽', e: '❤️‍🔥' },
      { v: 'от 8 000 ₽', e: '👑' },
    ],
  },
] as const

const CHANNELS = [
  { key: 'wa', label: 'WhatsApp' },
  { key: 'tg', label: 'Telegram' },
  { key: 'sms', label: 'SMS' },
] as const
const WHEN = [
  { key: 'today', label: 'Сегодня' },
  { key: 'tomorrow', label: 'Завтра' },
  { key: 'later', label: 'Позже' },
] as const

export function QuizBody({ inDialog }: { inDialog?: boolean }) {
  const { setQuizOpen, showThanks } = useUI()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [phone, setPhone] = useState('')
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]['key']>('wa')
  const [when, setWhen] = useState<(typeof WHEN)[number]['key']>('today')
  const [consent, setConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = STEPS.length + 1
  const pick = (key: string, v: string) => {
    goal('quiz_step', { step: step + 1, answer: v })
    if (key === 'to' && v.startsWith('Команде')) {
      goal('quiz_to_corporate')
      setQuizOpen(false)
      window.dispatchEvent(new CustomEvent('prefill-corporate'))
      setTimeout(() => scrollToId('corporate'), inDialog ? 250 : 0)
      return
    }
    setAnswers((a) => ({ ...a, [key]: v }))
    setStep((s) => s + 1)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPhoneValid(phone)) return setError('Проверьте номер телефона')
    if (!consent) return setError('Нужно согласие на обработку данных')
    setError('')
    setLoading(true)
    const ok = await submitLead({ source: 'quiz', phone, contact: channel, when, ...answers })
    setLoading(false)
    if (!ok) return setError('Не получилось отправить — попробуйте ещё раз или напишите в WhatsApp')
    goal('quiz_complete')
    setQuizOpen(false)
    showThanks()
    setStep(0)
    setAnswers({})
  }

  const current = STEPS[step]

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-surface shadow-soft" aria-label="Назад">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1}>
          <motion.div className="h-full rounded-full bg-honey" animate={{ width: `${((step + 1) / total) * 100}%` }} transition={{ type: 'spring', stiffness: 160, damping: 22 }} />
        </div>
        <span className="shrink-0 text-[13px] font-bold text-muted">
          {Math.min(step + 1, total)} / {total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
          {current ? (
            <>
              <h3 className="mb-4 font-display text-[24px] font-semibold leading-tight md:text-[28px]">{current.q}</h3>
              <div className={cn('grid gap-2.5', current.options.length > 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2')}>
                {current.options.map((o) => (
                  <button
                    key={o.v}
                    onClick={() => pick(current.key, o.v)}
                    className={cn(
                      'flex min-h-[92px] cursor-pointer flex-col items-start justify-between gap-2 rounded-2xl border-2 bg-surface p-3.5 text-left text-[14px] font-bold leading-snug transition hover:-translate-y-0.5 hover:border-honey hover:shadow-soft',
                      answers[current.key] === o.v ? 'border-honey' : 'border-transparent shadow-[0_0_0_1px_var(--color-line)]',
                    )}
                  >
                    <span className="text-[26px] leading-none">{o.e}</span>
                    {o.v}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <h3 className="font-display text-[26px] font-semibold leading-tight">Готово! Куда прислать подборку?</h3>
              <p className="mt-3 flex items-center gap-2 rounded-2xl bg-honey-100 px-4 py-3 text-[14px] font-bold">
                <Gift className="h-5 w-5 shrink-0 text-honey-600" /> + открытка с вашим текстом в подарок
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <PhoneInput value={phone} onChange={setPhone} aria-label="Телефон" />
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-ink-soft">Куда написать</p>
                  <Chips ariaLabel="Канал" options={CHANNELS} value={channel} onChange={setChannel} />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-ink-soft">Когда нужен букет</p>
                  <Chips ariaLabel="Когда" options={WHEN} value={when} onChange={setWhen} />
                </div>
                <Consent checked={consent} onChange={setConsent} />
                {error && <p className="rounded-xl bg-berry/10 px-3 py-2 text-sm font-semibold text-berry" role="alert">{error}</p>}
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Получить 3 варианта'}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function MasterBadge({ compact }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', compact ? '' : 'rounded-2xl bg-surface p-3 shadow-soft')}>
      <img src="/img/founder.webp" alt={`Мастер ${SITE.masterName}`} className="h-12 w-12 rounded-full object-cover object-top" loading="lazy" />
      <p className="text-[13px] leading-snug text-ink-soft">
        Подберёт <b className="text-ink">{SITE.masterName}</b>, собрала {SITE.ordersCount}+ букетов
      </p>
    </div>
  )
}

export function QuizSection() {
  return (
    <section id="quiz" className="py-14 md:py-24">
      <div className="container-x">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <SectionTitle
              className="mb-6 md:mb-8"
              eyebrow="Подбор за 1 минуту"
              title={
                <>
                  Не знаете, что выбрать? <span className="italic text-gold">Ответьте на 4 вопроса</span>
                </>
              }
              sub="Пришлём 3 идеальных варианта с ценами и фото — в удобный мессенджер."
            />
            <div className="relative hidden overflow-hidden rounded-3xl lg:block">
              <ParallaxImage src="/img/founder.webp" alt={`Мастер ${SITE.masterName} в мастерской`} className="aspect-square" imgClassName="object-top" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-scrim/95 p-4 backdrop-blur">
                <p className="font-display text-lg font-semibold">Подберёт {SITE.masterName}</p>
                <p className="text-[13px] text-ink-soft">Основатель мастерской, собрала {SITE.ordersCount}+ букетов</p>
              </div>
            </div>
            <div className="lg:hidden">
              <MasterBadge />
            </div>
          </div>
          <div className="relative rounded-[28px] bg-cream-2 p-5 md:p-8">
            <BorderBeam size={160} duration={9} />
            <QuizBody />
          </div>
        </div>
      </div>
    </section>
  )
}

export function QuizDialog() {
  const { quizOpen, setQuizOpen } = useUI()
  return (
    <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="pr-10 text-[13px] font-bold uppercase tracking-[0.12em] text-honey-600">Подбор букета за 1 минуту</DialogTitle>
        <DialogDescription className="sr-only">Ответьте на 4 вопроса — пришлём 3 варианта с ценами</DialogDescription>
        <div className="mb-4 mt-3">
          <MasterBadge compact />
        </div>
        <QuizBody inDialog />
      </DialogContent>
    </Dialog>
  )
}
