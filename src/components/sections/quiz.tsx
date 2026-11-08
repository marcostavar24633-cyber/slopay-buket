import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { MaxIcon, TelegramIcon } from '@/components/shared/icons'
import { SITE, maxLink, tgLink } from '@/lib/config'
import { copyNow } from '@/lib/copy'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'
import { cn } from '@/lib/utils'

/** Квиз-подбор: Кому → Повод → Бюджет → Куда прислать 3 варианта. Ответы уходят готовым сообщением в мессенджер. */
const STEPS = [
  { key: 'to', q: 'Кому дарим?', options: [{ v: 'Ей', e: '👩' }, { v: 'Ему', e: '🧔' }, { v: 'Маме', e: '💐' }, { v: 'Коллегам', e: '💼' }] },
  {
    key: 'occasion',
    q: 'Какой повод?',
    options: [{ v: 'День рождения', e: '🎂' }, { v: 'Праздник', e: '🎄' }, { v: 'Свидание', e: '❤️' }, { v: 'Без повода', e: '✨' }],
  },
  {
    key: 'budget',
    q: 'Какой бюджет?',
    options: [{ v: 'до 3 000 ₽', e: '💛' }, { v: '3 000 – 5 000 ₽', e: '🧡' }, { v: '5 000 – 8 000 ₽', e: '❤️‍🔥' }, { v: '8 000 ₽ и больше', e: '👑' }],
  },
] as const

export function QuizDialog() {
  const { quizOpen, setQuizOpen } = useUI()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const total = STEPS.length + 1
  const current = STEPS[step]

  const pick = (key: string, v: string) => {
    goal('quiz_step', { step: step + 1, answer: v })
    setAnswers((a) => ({ ...a, [key]: v }))
    setStep((s) => s + 1)
  }
  const text =
    `Здравствуйте! Пришлите, пожалуйста, 3 варианта букета с фото.\n` +
    `Кому: ${answers.to ?? '—'}\nПовод: ${answers.occasion ?? '—'}\nБюджет: ${answers.budget ?? '—'}`
  const done = (to: string) => {
    goal('quiz_complete', { to })
    if (to !== 'phone') copyNow(text)
  }
  const close = (v: boolean) => {
    setQuizOpen(v)
    if (!v) setTimeout(() => setStep(0), 300)
  }

  return (
    <Dialog open={quizOpen} onOpenChange={close}>
      <DialogContent className="max-w-xl">
        <DialogTitle className="pr-10 text-[13px] font-bold uppercase tracking-[0.12em] text-honey-600">Подбор букета за 2 минуты</DialogTitle>
        <DialogDescription className="sr-only">Три вопроса — и мы пришлём 3 варианта с фото и ценами</DialogDescription>

        <div className="my-4 flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="run-border grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface shadow-soft" aria-label="Назад">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1}>
            <div className="h-full rounded-full bg-honey transition-[width] duration-300" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
          <span className="shrink-0 text-[13px] font-bold text-muted">
            {step + 1} / {total}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
            {current ? (
              <>
                <h3 className="mb-4 font-display text-[24px] font-semibold leading-tight md:text-[28px]">{current.q}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {current.options.map((o) => (
                    <button
                      key={o.v}
                      onClick={() => pick(current.key, o.v)}
                      className={cn(
                        'run-border flex min-h-[84px] cursor-pointer flex-col items-start justify-between gap-2 rounded-2xl border-2 bg-surface p-3.5 text-left text-[15px] font-bold leading-snug transition',
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
              <div>
                <h3 className="font-display text-[24px] font-semibold leading-tight md:text-[28px]">Куда прислать 3 варианта с фото?</h3>
                <p className="mt-2 text-[14px] text-ink-soft">
                  {answers.to} · {answers.occasion} · {answers.budget}. Ответы уже в тексте сообщения.
                </p>
                <div className="mt-4 grid gap-2.5">
                  <Button variant="tg" size="lg" asChild>
                    <a href={tgLink(text)} target="_blank" rel="noopener" onClick={() => done('tg')}>
                      <TelegramIcon className="h-5 w-5" /> В Telegram
                    </a>
                  </Button>
                  <Button variant="max" size="lg" asChild>
                    <a href={maxLink(text)} target="_blank" rel="noopener" onClick={() => done('max')}>
                      <MaxIcon className="h-5 w-5" /> В MAX
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href={SITE.phoneHref} onClick={() => done('phone')}>
                      <Phone className="h-5 w-5" /> Позвонить: {SITE.phoneDisplay}
                    </a>
                  </Button>
                </div>
                <p className="mt-3 text-center text-[12.5px] font-semibold text-muted">Ответим в течение 15 минут, с 8:00 до 21:00</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
