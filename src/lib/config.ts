/**
 * Все контакты и бизнес-константы — в одном месте.
 * Значения придуманы для макета: замените на реальные перед запуском.
 */
export const SITE = {
  brand: 'Слопай букет',
  city: 'Ульяновск',
  phoneDisplay: '+7 (8422) 50-70-90',
  phoneHref: 'tel:+78422507090',
  waNumber: '79278007090', // без +, для wa.me
  tgUser: 'slopay_buket', // личный аккаунт магазина, не канал
  instagram: 'https://instagram.com/slopay_buket',
  vk: 'https://vk.com/slopay_buket',
  /** Профиль с отзывами на Авито — вставьте реальную ссылку */
  reviewsUrl: 'https://www.avito.ru/',
  reviewsSource: 'Авито',
  address: 'пр-т Ленинского Комсомола, 38, Новый город',
  hours: 'Ежедневно 8:00–21:00',
  sameDayDeadlineHour: 17, // до скольки принимаем «на сегодня»
  openHour: 8,
  timeZone: 'Europe/Ulyanovsk',
  /** Реквизиты ИП/самозанятого (ФИО, ИНН). Пусто — строка в подвале не показывается. */
  legal: '',
  /** Реальные данные со скриншотов Авито */
  rating: '5,0',
  reviewsCount: 55,
  sinceYear: 2020,
  freeDeliveryFrom: 6000,
  masterName: 'Мария',
  corpDeadline: '15 декабря',
  seasonSlotsLeft: 23,
} as const

export const waLink = (text: string) =>
  `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(text)}`

export const tgLink = (text?: string) =>
  `https://t.me/${SITE.tgUser}${text ? `?text=${encodeURIComponent(text)}` : ''}`

/** Предзаполненные тексты: разные для каждой кнопки, чтобы видеть, какая продаёт. */
export const WA = {
  header: 'Здравствуйте! Хочу заказать съедобный букет.',
  mobileBar: 'Здравствуйте! Хочу заказать букет. Подскажите, что можно успеть сегодня?',
  heroPhoto: 'Здравствуйте! Пришлю фото примера — соберёте похожий? 📷',
  custom: 'Здравствуйте! Хочу индивидуальный букет. Вот что люблю / вот фото-пример:',
  selection: 'Здравствуйте! Пришлите подборку из 3 вариантов. Повод: …, бюджет: … ₽',
  howOrder: 'Здравствуйте! Хочу оформить заказ на букет.',
  faq: 'Здравствуйте! У меня вопрос:',
  corporate: 'Здравствуйте! Интересует корпоративный заказ: … шт., дата …',
  final: 'Здравствуйте! Помогите подобрать букет.',
  thanks: 'Здравствуйте! Только что оставил(а) заявку на сайте — не хочу ждать 🙂',
  product: (name: string) =>
    `Здравствуйте! Хочу букет «${name}» (${location.origin}/#catalog). На какую дату свободно?`,
}
