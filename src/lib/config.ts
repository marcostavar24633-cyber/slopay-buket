/**
 * Все контакты и бизнес-константы — в одном месте.
 * Значения придуманы для макета: замените на реальные перед запуском.
 */
/** Адрес фото букетов: с того же сайта, где открыта страница (github.io или слопайбукет.рф). */
function photoBase() {
  const live = typeof location !== 'undefined' && /(github\.io|xn--80acmogcvipsi\.xn--p1ai)$/.test(location.hostname)
  return (live ? location.origin + import.meta.env.BASE_URL : 'https://xn--80acmogcvipsi.xn--p1ai/') + 'tg/'
}

export const SITE = {
  brand: 'Слопай букет',
  city: 'Ульяновск',
  phoneDisplay: '+7 (963) 128-25-56',
  phoneHref: 'tel:+79631282556',
  /** Ссылка на профиль в мессенджере MAX: в приложении MAX → Профиль → «Поделиться». Вставьте сюда. */
  maxUrl: 'https://max.ru/u/f9LHodD0cOIE-osl7ttL5eRn4vgUkh_e5h3PmiZSsO1SgIH36TnP4Afv9sI',
  /** Telegram по номеру телефона */
  tgPhone: '79631282556',
  /** Группа ВКонтакте. Пусто — иконка в подвале не показывается. */
  vk: '',
  /** Профиль с отзывами на Авито */
  reviewsUrl: 'https://www.avito.ru/brands/9a13b8c170cfd15b30f9f3b09a58c35d/all/produkty_pitaniya?sellerId=d499c4c42b1c18a0256224de534bf28a',
  reviewsSource: 'Авито',
  address: 'ул. Карбышева, 37, Новый город',
  hours: 'Ежедневно 8:00–21:00',
  sameDayDeadlineHour: 17, // до скольки принимаем «на сегодня»
  openHour: 8,
  timeZone: 'Europe/Ulyanovsk',
  /** Продавец — для подвала, политики и оферты. Заполните перед запуском. */
  ownerName: '', // напр. «ИП Иванова Мария Ивановна» или «Иванова Мария Ивановна (самозанятая)»
  inn: '',
  email: '',
  /** Адрес сайта без слеша в конце — для sitemap.xml, robots.txt и превью ссылок */
  url: 'https://xn--80acmogcvipsi.xn--p1ai', // слопайбукет.рф
  /** Реальные данные со скриншотов Авито */
  rating: '5,0',
  reviewsCount: 107,
  /** со страницы продавца на Авито */
  avitoSince: '2020',
  sinceYear: 2020,
  freeDeliveryFrom: 8000,
  masterName: 'Мария',
  corpDeadline: '5 декабря',
  /** Публичные JPG-фото букетов (public/tg/): ссылка в сообщении → Telegram показывает фото в чате. */
  photoBase: photoBase(),
} as const

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
export const SEASONS: { from: string; until: string; text: string; href: string }[] = [
  { from: '2026-10-15', until: '2026-12-05', text: '🎄 Новогодние букеты и корпоративные подарки: приём заказов до 5 декабря', href: 'corporate/' },
  { from: '2027-01-15', until: '2027-02-12', text: '❤️ 14 Февраля: сердца из клубники — бронируйте дату заранее', href: '#catalog' },
  { from: '2027-02-15', until: '2027-03-06', text: '🌷 8 Марта: ягодные букеты и корзины — бронируйте дату заранее', href: '#catalog' },
]

/** Метка источника в каждом готовом сообщении — чтобы в переписке видеть заказы с сайта. */
export const SOURCE_TAG = '(с сайта)'
export function withSource(text: string) {
  if (text.includes(SOURCE_TAG)) return text
  const i = text.indexOf('\n')
  return i < 0 ? `${text} ${SOURCE_TAG}` : `${text.slice(0, i)} ${SOURCE_TAG}${text.slice(i)}`
}

/** Предзаполненные тексты: разные для каждой кнопки, чтобы видеть, какая продаёт. */
export const MSG = {
  header: 'Здравствуйте! Хочу подобрать букет',
  hero: 'Здравствуйте! Хочу подобрать букет',
  mobileBar: 'Здравствуйте! Хочу заказать букет.',
  heroPhoto: 'Здравствуйте! Пришлю фото примера — соберёте похожий? 📷',
  custom: 'Здравствуйте! Хочу индивидуальный букет. Вот что люблю / вот фото-пример:',
  selection: 'Здравствуйте! Пришлите подборку из 3 вариантов. Повод: …, бюджет: … ₽',
  howOrder: 'Здравствуйте! Хочу оформить заказ на букет.',
  faq: 'Здравствуйте! У меня вопрос:',
  corporate: 'Здравствуйте! Интересует корпоративный заказ: … шт., дата …',
  final: 'Здравствуйте! Помогите подобрать букет.',
  product: (name: string) =>
    `Здравствуйте! Хочу заказать: ${name}. На какую дату свободно?`,
}
