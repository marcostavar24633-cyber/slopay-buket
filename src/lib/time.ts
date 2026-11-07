import { SITE } from './config'

/** Текущее время в Ульяновске (UTC+4), независимо от часового пояса посетителя. */
export function ulyanovskNow(d = new Date()) {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: SITE.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  return { h: get('hour'), m: get('minute'), s: get('second') }
}

export interface OrderWindow {
  acceptingToday: boolean
  /** секунд до дедлайна «на сегодня»; 0 если окно закрыто */
  secondsLeft: number
}

export function orderWindow(d = new Date()): OrderWindow {
  const { h, m, s } = ulyanovskNow(d)
  const now = h * 3600 + m * 60 + s
  const open = SITE.openHour * 3600
  const deadline = SITE.sameDayDeadlineHour * 3600
  const acceptingToday = now >= open && now < deadline
  return { acceptingToday, secondsLeft: acceptingToday ? deadline - now : 0 }
}

export function formatLeft(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h > 0 ? `${h} ч ${m} мин` : `${m} мин`
}
