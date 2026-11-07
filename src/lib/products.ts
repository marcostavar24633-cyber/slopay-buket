/**
 * Каталог на реальных фото мастерской. Названия, состав «по фото» и цены — ЧЕРНОВИК:
 * сверьте с прайсом Марии и поправьте здесь.
 */
export type Recipient = 'her' | 'him' | 'colleagues' | 'kids' | 'mama'
export type Composition = 'berry' | 'meat' | 'sea' | 'dried' | 'sweet' | 'snack'
export type Occasion = 'newyear'

export interface Size {
  key: 'S' | 'M' | 'L'
  price: number
  /** габарит: «≈ 40 см» или «Коробка 30×30 см» */
  dims: string
  persons: string
  note: string
}

export interface Product {
  id: string
  name: string
  image: string
  /** вторая реальная работа той же категории — показывается по свайпу/наведению */
  alt?: string
  composition: string
  sizes: Size[]
  recipients: Recipient[]
  type: Composition
  occasions?: Occasion[]
  badges: Array<'hit' | 'today' | 'men' | 'new' | 'season'>
}

const R = (p: string) => `/img/real/${p}.webp`

export const PRODUCTS: Product[] = [
  {
    id: 'klubnichnoe-serdce',
    name: 'Клубничное сердце',
    image: R('berry/yag-1'),
    alt: R('berry/yag-16'),
    composition: 'Коробка-сердце: крупная клубника, голубика, макаронс, сахарные сердечки',
    sizes: [
      { key: 'S', price: 2990, dims: 'Сердце 25 см', persons: '1–2', note: '≈ 15 ягод клубники' },
      { key: 'M', price: 3990, dims: 'Сердце 30 см', persons: '2–3', note: '≈ 22 ягоды клубники' },
      { key: 'L', price: 5490, dims: 'Сердце 38 см', persons: '3–5', note: '≈ 35 ягод клубники' },
    ],
    recipients: ['her', 'mama'],
    type: 'berry',
    badges: ['hit', 'today'],
  },
  {
    id: 'raki-buket',
    name: 'Раковый букет',
    image: R('sea/m-1'),
    alt: R('sea/m-21'),
    composition: 'Варёные раки, лимон, черри, свежая зелень, крафт и чёрная плёнка',
    sizes: [
      { key: 'S', price: 4990, dims: '≈ 45 см', persons: '2–3', note: '≈ 1 кг раков' },
      { key: 'M', price: 6990, dims: '≈ 50 см', persons: '3–5', note: '≈ 1,5 кг раков' },
      { key: 'L', price: 8990, dims: '≈ 55 см', persons: '5–7', note: '≈ 2 кг раков' },
    ],
    recipients: ['him', 'colleagues'],
    type: 'sea',
    badges: ['hit', 'men'],
  },
  {
    id: 'muzhskoy-razgovor',
    name: 'Мужской разговор',
    image: R('meat/k-1'),
    alt: R('meat/k-34'),
    composition: 'Сырокопчёные колбасы, сыр, свежие багеты, черри, сырные шарики, зелень',
    sizes: [
      { key: 'S', price: 3990, dims: '≈ 45 см', persons: '2–3', note: '≈ 700 г мяса и сыра' },
      { key: 'M', price: 5490, dims: '≈ 50 см', persons: '3–5', note: '≈ 1 кг мяса и сыра' },
      { key: 'L', price: 6990, dims: '≈ 55 см', persons: '5–7', note: '≈ 1,4 кг мяса и сыра' },
    ],
    recipients: ['him', 'colleagues'],
    type: 'meat',
    badges: ['hit', 'men', 'today'],
  },
  {
    id: 'klubnika-shlyapnaya',
    name: 'Клубника в шляпной коробке',
    image: R('berry/yag-14'),
    alt: R('berry/yag-15'),
    composition: 'Клубника, голубика, живые тюльпаны и эвкалипт в красной шляпной коробке',
    sizes: [
      { key: 'S', price: 3490, dims: 'Коробка Ø 18 см', persons: '2–3', note: '≈ 20 ягод клубники' },
      { key: 'M', price: 4490, dims: 'Коробка Ø 22 см', persons: '3–4', note: '≈ 30 ягод клубники' },
    ],
    recipients: ['her', 'mama', 'colleagues'],
    type: 'berry',
    badges: ['today'],
  },
  {
    id: 'vostochnaya-skazka',
    name: 'Восточная сказка',
    image: R('dried/suh-11'),
    alt: R('dried/suh-19'),
    composition: 'Курага, финики, чернослив, цукаты, орехи и розы из вяленых фруктов',
    sizes: [
      { key: 'S', price: 2990, dims: '≈ 35 см', persons: '2–4', note: '≈ 700 г сухофруктов' },
      { key: 'M', price: 3990, dims: '≈ 40 см', persons: '4–6', note: '≈ 1 кг сухофруктов' },
    ],
    recipients: ['her', 'mama', 'colleagues'],
    type: 'dried',
    badges: ['today'],
  },
  {
    id: 'yagody-i-rozy',
    name: 'Ягоды и розы',
    image: R('berry/yag-25'),
    alt: R('berry/yag-17'),
    composition: 'Большое сердце: клубника, малина, голубика, живые розы, макаронс',
    sizes: [
      { key: 'M', price: 6990, dims: 'Сердце 40 см', persons: '4–6', note: '≈ 50 ягод' },
      { key: 'L', price: 8990, dims: 'Сердце 50 см', persons: '6–8', note: '≈ 75 ягод' },
    ],
    recipients: ['her'],
    type: 'berry',
    badges: ['hit'],
  },
  {
    id: 'raki-krevetki',
    name: 'Раки и креветки',
    image: R('sea/m-16'),
    alt: R('sea/m-31'),
    composition: 'Раки, королевские креветки, черри, лимон, салат — готовый стол к пиву',
    sizes: [
      { key: 'M', price: 6990, dims: 'Корзина 40 см', persons: '3–5', note: '≈ 1,2 кг морепродуктов' },
      { key: 'L', price: 9490, dims: 'Корзина 50 см', persons: '5–8', note: '≈ 1,8 кг морепродуктов' },
    ],
    recipients: ['him', 'colleagues'],
    type: 'sea',
    badges: ['men'],
  },
  {
    id: 'pryanichnyy-domik',
    name: 'Пряничный домик',
    image: R('sweet/sl-10'),
    alt: R('sweet/sl-8'),
    composition: 'Деревянный домик: имбирные пряники, конфеты, орехи в шоколаде, мармелад',
    sizes: [{ key: 'M', price: 2990, dims: 'Домик 30×25 см', persons: '2–4', note: '≈ 800 г сладостей' }],
    recipients: ['kids', 'mama', 'colleagues', 'her'],
    type: 'sweet',
    occasions: ['newyear'],
    badges: ['season'],
  },
  {
    id: 'novogodnyaya-elka',
    name: 'Новогодняя ёлка',
    image: R('dried/suh-35'),
    alt: R('dried/suh-1'),
    composition: 'Поднос-ёлка: сухофрукты, цукаты, орехи, мармелад и конфеты',
    sizes: [
      { key: 'S', price: 3490, dims: 'Ёлка 35 см', persons: '3–5', note: '≈ 900 г' },
      { key: 'M', price: 4490, dims: 'Ёлка 45 см', persons: '5–7', note: '≈ 1,3 кг' },
    ],
    recipients: ['her', 'him', 'mama', 'colleagues', 'kids'],
    type: 'dried',
    occasions: ['newyear'],
    badges: ['season', 'new'],
  },
  {
    id: 'yubilyar',
    name: 'Юбиляр',
    image: R('meat/k-24'),
    alt: R('meat/k-23'),
    composition: 'Сыровяленые колбасы, сыр-косичка, твёрдый сыр, черри, зелень',
    sizes: [
      { key: 'M', price: 4490, dims: '≈ 50 см', persons: '3–5', note: '≈ 900 г мяса и сыра' },
      { key: 'L', price: 5990, dims: '≈ 55 см', persons: '5–7', note: '≈ 1,3 кг мяса и сыра' },
    ],
    recipients: ['him', 'colleagues'],
    type: 'meat',
    badges: ['men'],
  },
  {
    id: 'sunduk-kapitana',
    name: 'Сундук капитана',
    image: R('sea/m-35'),
    alt: R('sea/m-9'),
    composition: 'Деревянный сундук: раки, краб, лимоны, ракушки и топпер с надписью',
    sizes: [{ key: 'L', price: 12990, dims: 'Сундук 45×30 см', persons: '6–10', note: '≈ 2,5 кг морепродуктов' }],
    recipients: ['him', 'colleagues'],
    type: 'sea',
    badges: ['new'],
  },
  {
    id: 'mame-s-lyubovyu',
    name: 'Маме с любовью',
    image: R('dried/suh-10'),
    alt: R('dried/suh-3'),
    composition: 'Деревянное сердце «маме»: орехи, финики, курага, конфеты',
    sizes: [{ key: 'M', price: 3490, dims: 'Сердце 35 см', persons: '3–5', note: '≈ 800 г' }],
    recipients: ['mama'],
    type: 'dried',
    badges: [],
  },
  {
    id: 'rozy-i-konfety',
    name: 'Розы и конфеты',
    image: R('sweet/sl-25'),
    alt: R('sweet/sl-16'),
    composition: 'Ящик: живые розы и альстромерии + 20 конфет с хрустящей начинкой',
    sizes: [{ key: 'M', price: 3990, dims: 'Ящик 30×25 см', persons: '2–4', note: '20 конфет' }],
    recipients: ['her', 'mama'],
    type: 'sweet',
    badges: [],
  },
  {
    id: 'ostryy-perchik',
    name: 'Острый перчик',
    image: R('meat/k-12'),
    alt: R('meat/k-28'),
    composition: 'Колбаски, перец чили, черри, сыр, лимон, зелень в чёрной упаковке',
    sizes: [
      { key: 'S', price: 3790, dims: '≈ 45 см', persons: '2–3', note: '≈ 700 г' },
      { key: 'M', price: 4990, dims: '≈ 50 см', persons: '3–5', note: '≈ 1 кг' },
    ],
    recipients: ['him', 'colleagues'],
    type: 'meat',
    badges: ['men'],
  },
  {
    id: 'yagodnaya-korzina',
    name: 'Ягодная корзина',
    image: R('berry/yag-12'),
    alt: R('berry/yag-22'),
    composition: 'Плетёная корзина: клубника, ежевика, голубика, атласная лента',
    sizes: [
      { key: 'M', price: 4990, dims: 'Корзина 30 см', persons: '3–5', note: '≈ 1 кг ягод' },
      { key: 'L', price: 6490, dims: 'Корзина 40 см', persons: '5–7', note: '≈ 1,5 кг ягод' },
    ],
    recipients: ['her', 'mama', 'colleagues'],
    type: 'berry',
    badges: [],
  },
  {
    id: 'sladkiy-boks',
    name: 'Сладкий бокс',
    image: R('sweet/sl-22'),
    alt: R('sweet/sl-7'),
    composition: 'Шестигранный бокс: печенье, мармелад, безе, джем и конфеты',
    sizes: [
      { key: 'S', price: 2490, dims: 'Бокс 25 см', persons: '1–3', note: '≈ 600 г сладостей' },
      { key: 'M', price: 3290, dims: 'Бокс 32 см', persons: '3–5', note: '≈ 900 г сладостей' },
    ],
    recipients: ['kids', 'colleagues', 'her'],
    type: 'sweet',
    badges: ['today'],
  },
  {
    id: 'tachka',
    name: 'Тачка',
    image: R('snack/sn-3'),
    composition: 'Подставки-машинки со снеками: чипсы, арахис, сухарики, вяленое мясо',
    sizes: [{ key: 'M', price: 2490, dims: '2 машинки по 30 см', persons: '2–4', note: '≈ 700 г снеков' }],
    recipients: ['him'],
    type: 'snack',
    badges: ['men'],
  },
]

export const RECIPIENT_TABS: { key: Recipient | 'all' | 'newyear'; label: string }[] = [
  { key: 'newyear', label: '🎄 Новый год' },
  { key: 'all', label: 'Все' },
  { key: 'her', label: 'Для неё' },
  { key: 'him', label: 'Для него' },
  { key: 'colleagues', label: 'Коллегам и партнёрам' },
  { key: 'kids', label: 'Ребёнку' },
  { key: 'mama', label: 'Маме' },
]

export const TYPE_TABS: { key: Composition; label: string }[] = [
  { key: 'berry', label: 'Ягодные' },
  { key: 'meat', label: 'Мясные' },
  { key: 'sea', label: 'Раки и морепродукты' },
  { key: 'dried', label: 'Сухофрукты и орехи' },
  { key: 'sweet', label: 'Сладкие' },
  { key: 'snack', label: 'Снеки' },
]

export const PRICE_TABS = [
  { key: 'p1', label: 'до 3 000 ₽', min: 0, max: 3000 },
  { key: 'p2', label: '3–5 тыс.', min: 3000, max: 5000 },
  { key: 'p3', label: '5–8 тыс.', min: 5000, max: 8000 },
  { key: 'p4', label: 'от 8 тыс.', min: 8000, max: Infinity },
] as const

export const UPSELLS = [
  { id: 'balloons', name: 'Связка из 5 шаров', price: 790, emoji: '🎈' },
  { id: 'sparkling', name: 'Безалкогольное игристое', price: 590, emoji: '🥂' },
  { id: 'bear', name: 'Плюшевый мишка 25 см', price: 890, emoji: '🧸' },
  { id: 'candle', name: 'Свеча-цифра', price: 250, emoji: '🕯️' },
]

export const minPrice = (p: Product) => Math.min(...p.sizes.map((s) => s.price))
/** Цена-якорь на первом экране: самый популярный малый — «Клубничное сердце» S. */
export const ANCHOR_PRICE = 2990
