import { MESSAGES_DATA, SEASONS_DATA, SITE_DATA } from '@/lib/content'

/**
 * Все контакты и бизнес-константы — в одном месте.
 * Значения придуманы для макета: замените на реальные перед запуском.
 */
/** Адрес фото букетов: с того же сайта, где открыта страница (github.io или слопайбукет.рф). */
function photoBase() {
  const live = typeof location !== 'undefined' && /(github\.io|xn--80acmogcvipsi\.xn--p1ai)$/.test(location.hostname)
  return (live ? location.origin + import.meta.env.BASE_URL : 'https://xn--80acmogcvipsi.xn--p1ai/') + 'tg/'
}

const digits = SITE_DATA.phone.replace(/\D/g, '').replace(/^8/, '7')

/** Контакты и бизнес-данные — из админки (content/site.json). */
export const SITE = {
  ...SITE_DATA,
  phoneDisplay: SITE_DATA.phone,
  phoneHref: `tel:+${digits}`,
  /** Telegram по номеру телефона */
  tgPhone: digits,
  avitoSince: String(SITE_DATA.sinceYear),
  sameDayDeadlineHour: 17, // до скольки принимаем «на сегодня»
  openHour: 8,
  timeZone: 'Europe/Ulyanovsk',
  /** Адрес сайта без слеша в конце — для sitemap.xml, robots.txt и превью ссылок */
  url: 'https://xn--80acmogcvipsi.xn--p1ai', // слопайбукет.рф
  /** Публичные JPG-фото букетов (public/tg/): ссылка в сообщении → Telegram показывает фото в чате. */
  photoBase: photoBase(),
}

/** Строка с реквизитами: «ИП …, ИНН …». Пусто, пока не заполнено. */
export const legalLine = () => [SITE.ownerName, SITE.inn && `ИНН ${SITE.inn}`].filter(Boolean).join(', ')

/** MAX не поддерживает предзаполненный текст — ведём в профиль. Аргумент оставлен для аналитики и будущего API. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const maxLink = (_text?: string) => SITE.maxUrl

/**
 * Telegram по номеру. Параметр text официально поддерживается (core.telegram.org/api/links → Phone number links):
 * Telegram вписывает его в поле ввода, клиенту остаётся нажать «Отправить».
 */
export const tgLink = (text?: string) => `https://t.me/+${SITE.tgPhone}${text ? `?text=${encodeURIComponent(withSource(text))}` : ''}`

/**
 * Сезонный баннер под шапкой: показывается в своём промежутке дат, с отсчётом дней до конца приёма заказов.
 * Добавляйте новые сезоны сюда (даты — по Ульяновску).
 */
export const SEASONS = SEASONS_DATA

/** Метка источника в каждом готовом сообщении — чтобы в переписке видеть заказы с сайта. */
export const SOURCE_TAG = '(с сайта)'
export function withSource(text: string) {
  if (text.includes(SOURCE_TAG)) return text
  const i = text.indexOf('\n')
  return i < 0 ? `${text} ${SOURCE_TAG}` : `${text.slice(0, i)} ${SOURCE_TAG}${text.slice(i)}`
}

/** Предзаполненные тексты: разные для каждой кнопки, чтобы видеть, какая продаёт. */
export const MSG = {
  ...MESSAGES_DATA,
  product: (name: string) => `Здравствуйте! Хочу заказать: ${name}. На какую дату свободно?`,
} as Record<string, string> & { product: (name: string) => string }

