export type Recipient = 'her' | 'him' | 'colleagues' | 'kids' | 'mama'
export type Composition = 'meat' | 'sweet' | 'fruit' | 'box'
export type Occasion = 'newyear'

export interface Size {
  key: 'S' | 'M' | 'L'
  price: number
  height: number
  persons: string
  note: string
}

export interface Product {
  id: string
  name: string
  image: string
  /** фото букета в руках: главный страх «привезут крошечный» */
  inHands?: string
  composition: string
  sizes: Size[]
  recipients: Recipient[]
  type: Composition
  occasions?: Occasion[]
  badges: Array<'hit' | 'today' | 'men' | 'new' | 'season'>
}

export const PRODUCTS: Product[] = [
  {
    id: 'klubnichny-poceluy',
    name: 'Клубничный поцелуй',
    image: '/img/straw.webp',
    inHands: '/img/inhands.webp',
    composition: 'Клубника в бельгийском шоколаде с золотой посыпкой, упаковка в пудровую бумагу',
    sizes: [
      { key: 'S', price: 2990, height: 30, persons: '1–2', note: '9 клубник' },
      { key: 'M', price: 3990, height: 35, persons: '2–3', note: '15 клубник' },
      { key: 'L', price: 5490, height: 42, persons: '3–5', note: '25 клубник' },
    ],
    recipients: ['her', 'mama'],
    type: 'sweet',
    badges: ['hit', 'today'],
  },
  {
    id: 'muzhskoy-razgovor',
    name: 'Мужской разговор',
    image: '/img/meat.webp',
    inHands: '/img/meathands.webp',
    composition: 'Хамон, салями, охотничьи колбаски, пармезан и маасдам, претцели, черри, розмарин',
    sizes: [
      { key: 'S', price: 4490, height: 38, persons: '2–3', note: '≈ 600 г мяса и сыра' },
      { key: 'M', price: 5990, height: 45, persons: '3–5', note: '≈ 900 г мяса и сыра' },
      { key: 'L', price: 7990, height: 52, persons: '5–7', note: '≈ 1,3 кг мяса и сыра' },
    ],
    recipients: ['him', 'colleagues'],
    type: 'meat',
    badges: ['hit', 'men', 'today'],
  },
  {
    id: 'parizhskoe-utro',
    name: 'Парижское утро',
    image: '/img/hero.webp',
    inHands: '/img/inhands.webp',
    composition: '15 клубник в тёмном и белом шоколаде, 6 макаронс, эвкалипт, атласная лента',
    sizes: [
      { key: 'S', price: 3790, height: 35, persons: '2–3', note: '11 клубник, 4 макаронс' },
      { key: 'M', price: 4690, height: 40, persons: '3–4', note: '15 клубник, 6 макаронс' },
      { key: 'L', price: 6490, height: 48, persons: '4–6', note: '23 клубники, 9 макаронс' },
    ],
    recipients: ['her', 'mama', 'colleagues'],
    type: 'sweet',
    badges: ['hit', 'today'],
  },
  {
    id: 'novogodnee-chudo',
    name: 'Новогоднее чудо',
    image: '/img/newyear.webp',
    composition: 'Абхазские мандарины, клубника в шоколаде, имбирные пряники, сырное ассорти, ель и корица',
    sizes: [
      { key: 'S', price: 3990, height: 12, persons: '2–3', note: 'Коробка 25×25 см' },
      { key: 'M', price: 5490, height: 14, persons: '3–5', note: 'Коробка 35×30 см' },
    ],
    recipients: ['her', 'him', 'mama', 'colleagues', 'kids'],
    type: 'box',
    occasions: ['newyear'],
    badges: ['season', 'new'],
  },
  {
    id: 'syrny-somelye',
    name: 'Сырный сомелье',
    image: '/img/cheese.webp',
    composition: 'Камамбер, бри, дорблю, розы из прошутто, инжир, виноград, соты с мёдом, грецкий орех',
    sizes: [
      { key: 'M', price: 6490, height: 45, persons: '4–6', note: '≈ 1 кг сыра и мяса' },
      { key: 'L', price: 8490, height: 52, persons: '6–8', note: '≈ 1,4 кг сыра и мяса' },
    ],
    recipients: ['her', 'mama', 'colleagues', 'him'],
    type: 'meat',
    badges: [],
  },
  {
    id: 'tropicheskiy-ray',
    name: 'Тропический рай',
    image: '/img/fruit.webp',
    inHands: '/img/fruithands.webp',
    composition: 'Цветы из ананаса, виноград двух сортов, киви, манго, голубика, физалис, мята',
    sizes: [
      { key: 'S', price: 3490, height: 35, persons: '2–4', note: '≈ 1,2 кг фруктов' },
      { key: 'M', price: 4790, height: 42, persons: '4–6', note: '≈ 1,8 кг фруктов' },
    ],
    recipients: ['her', 'mama', 'kids'],
    type: 'fruit',
    badges: ['today'],
  },
  {
    id: 'futbolny-vecher',
    name: 'Футбольный вечер',
    image: '/img/snack.webp',
    composition: 'Колбаски, вяленое мясо, рыбные палочки, сырные косички, фисташки, гренки + лимонад',
    sizes: [
      { key: 'S', price: 3790, height: 40, persons: '2–3', note: '≈ 700 г снеков' },
      { key: 'M', price: 4990, height: 48, persons: '3–5', note: '≈ 1 кг снеков' },
    ],
    recipients: ['him', 'colleagues'],
    type: 'meat',
    badges: ['men'],
  },
  {
    id: 'sladkoe-detstvo',
    name: 'Сладкое детство',
    image: '/img/kids.webp',
    composition: 'Маршмеллоу, леденцы на палочке, безе, шоколадные батончики, клубника в шоколаде',
    sizes: [
      { key: 'S', price: 2490, height: 32, persons: '1–2', note: '≈ 25 сладостей' },
      { key: 'M', price: 3490, height: 40, persons: '2–4', note: '≈ 40 сладостей' },
    ],
    recipients: ['kids'],
    type: 'sweet',
    badges: ['today'],
  },
  {
    id: 'delovoy-podhod',
    name: 'Деловой подход',
    image: '/img/corp.webp',
    composition: 'Бокс: 6 клубник в шоколаде, бри, мандарины, именная открытка, лента с вашим логотипом',
    sizes: [
      { key: 'S', price: 2290, height: 10, persons: '1–2', note: 'Бокс 20×20 см' },
      { key: 'M', price: 3290, height: 12, persons: '2–3', note: 'Бокс 25×25 см' },
    ],
    recipients: ['colleagues'],
    type: 'box',
    occasions: ['newyear'],
    badges: ['season'],
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
  { key: 'meat', label: 'Мясные и сырные' },
  { key: 'sweet', label: 'Клубника и сладкое' },
  { key: 'fruit', label: 'Фруктовые' },
  { key: 'box', label: 'Праздничные боксы' },
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
export const ANCHOR_PRICE = 2990
