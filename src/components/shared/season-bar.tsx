import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { SEASONS } from '@/lib/config'
import { goal } from '@/lib/analytics'

const DAY = 864e5
const days = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'день' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'дня' : 'дней')

function current() {
  const now = Date.now()
  const i = SEASONS.findIndex((s) => now >= new Date(s.from + 'T00:00:00+04:00').getTime() && now < new Date(s.until + 'T23:59:59+04:00').getTime())
  if (i < 0) return null
  return { i, left: Math.max(1, Math.ceil((new Date(SEASONS[i].until + 'T23:59:59+04:00').getTime() - now) / DAY)) }
}

/**
 * Сезонный баннер под шапкой с отсчётом дней. Считается сразу при первой отрисовке — поэтому попадает
 * в готовую разметку (пререндер) и не сдвигает первый экран при загрузке. Сайт пересобирается раз в сутки,
 * так что число дней в разметке свежее; в браузере оно уточняется.
 */
export function SeasonBar() {
  const [state, setState] = useState(current)
  const [hidden, setHidden] = useState(false)
  useEffect(() => setState(current()), [])
  if (!state || hidden) return null
  const s = SEASONS[state.i]
  return (
    <aside aria-label="Сезонное предложение" className="relative z-30 border-b border-honey/25 bg-honey-100">
      <div className="container-x flex min-h-11 items-center justify-center gap-x-3 gap-y-0.5 py-1.5 pr-10 text-center text-[13px] font-semibold leading-snug max-md:flex-wrap md:text-[14px]">
        <a href={s.href.startsWith('#') ? s.href : import.meta.env.BASE_URL + s.href} onClick={() => goal('season_click', { i: state.i })} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
          {s.text}
        </a>
        <span className="rounded-full bg-honey px-2.5 py-0.5 text-[12px] font-extrabold text-onaccent">
          осталось {state.left} {days(state.left)}
        </span>
      </div>
      <button onClick={() => setHidden(true)} aria-label="Скрыть" className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-ink-soft hover:text-ink">
        <X className="h-4 w-4" />
      </button>
    </aside>
  )
}
