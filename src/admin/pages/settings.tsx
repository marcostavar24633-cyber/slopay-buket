/** Настройки: название и контакты, первый экран, поводы, сезонные баннеры, тексты готовых сообщений. */
import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { GALLERY_CATS } from '@/lib/gallery'
import { cn } from '@/lib/utils'
import { useStore } from '../store'
import { Badge, Btn, Card, IconBtn, ImageField, PageHead, Select, TextArea, TextInput } from '../ui'

type Tab = 'main' | 'hero' | 'occasions' | 'seasons' | 'messages'
const TABS: { key: Tab; label: string }[] = [
  { key: 'main', label: 'Основное' },
  { key: 'hero', label: 'Первый экран' },
  { key: 'occasions', label: 'Поводы' },
  { key: 'seasons', label: 'Сезонные баннеры' },
  { key: 'messages', label: 'Тексты сообщений' },
]

export function Settings() {
  const [tab, setTab] = useState<Tab>('main')
  return (
    <>
      <PageHead title="Настройки" sub="Название, контакты и тексты, которые встречаются по всему сайту." />
      <div role="tablist" className="no-scrollbar -mx-3 mb-4 flex gap-1 overflow-x-auto px-3 md:mx-0 md:px-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn('h-10 shrink-0 cursor-pointer rounded-xl px-4 text-[14px] font-semibold', tab === t.key ? 'bg-honey/15 text-honey-600' : 'text-ink-soft hover:bg-ink/5')}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'main' && <Main />}
      {tab === 'hero' && <Hero />}
      {tab === 'occasions' && <Occasions />}
      {tab === 'seasons' && <Seasons />}
      {tab === 'messages' && <Messages />}
    </>
  )
}

function Main() {
  const { data, set } = useStore()
  const s = data.site
  const f = <K extends keyof typeof s>(k: K) => (v: string) => set('site', (d) => void ((d as Record<string, unknown>)[k] = typeof s[k] === 'number' ? Number(v) : v))
  return (
    <div className="grid gap-4">
      <Card title="Название и поисковики">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Название" value={s.brand} onChange={f('brand')} hint="В шапке, подвале и превью ссылок" />
          <TextInput label="Подпись под названием" value={s.tagline} onChange={f('tagline')} />
          <TextInput className="md:col-span-2" label="Заголовок страницы в поиске (title)" value={s.seoTitle} onChange={f('seoTitle')} hint={`${s.seoTitle.length} символов, лучше до 70`} />
          <TextArea className="md:col-span-2" rows={3} label="Описание в поиске (description)" value={s.seoDescription} onChange={f('seoDescription')} hint={`${s.seoDescription.length} символов, лучше 140–200`} />
        </div>
      </Card>
      <Card title="Контакты">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Телефон" value={s.phone} onChange={f('phone')} hint="По нему же открывается Telegram" />
          <TextInput label="Ссылка на MAX" value={s.maxUrl} onChange={f('maxUrl')} />
          <TextInput label="Адрес мастерской" value={s.address} onChange={f('address')} />
          <TextInput label="Часы работы" value={s.hours} onChange={f('hours')} />
          <TextInput label="Строка о времени ответа" value={s.responseNote} onChange={f('responseNote')} hint="Под кнопками мессенджеров" />
          <TextInput label="Группа ВКонтакте" value={s.vk} onChange={f('vk')} placeholder="https://vk.com/…" hint="Пусто — значок не показывается" />
        </div>
      </Card>
      <Card title="Отзывы и цифры">
        <div className="grid gap-4 md:grid-cols-3">
          <TextInput label="Рейтинг" value={s.rating} onChange={f('rating')} />
          <TextInput label="Число отзывов" type="number" value={s.reviewsCount} onChange={f('reviewsCount')} />
          <TextInput label="Год начала работы" type="number" value={s.sinceYear} onChange={f('sinceYear')} />
          <TextInput label="Где отзывы" value={s.reviewsSource} onChange={f('reviewsSource')} />
          <TextInput className="md:col-span-2" label="Ссылка на отзывы" value={s.reviewsUrl} onChange={f('reviewsUrl')} />
        </div>
      </Card>
      <Card title="Условия">
        <div className="grid gap-4 md:grid-cols-3">
          <TextInput label="Бесплатная доставка от, ₽" type="number" value={s.freeDeliveryFrom} onChange={f('freeDeliveryFrom')} />
          <TextInput label="Имя мастера" value={s.masterName} onChange={f('masterName')} />
          <TextInput label="Корпоративные заказы до" value={s.corpDeadline} onChange={f('corpDeadline')} hint="Например: 5 декабря" />
        </div>
      </Card>
      <Card title="Продавец (для подвала и оферты)" actions={!s.inn && <Badge tone="danger">не заполнено</Badge>}>
        <div className="grid gap-4 md:grid-cols-3">
          <TextInput label="ФИО / ИП" value={s.ownerName} onChange={f('ownerName')} placeholder="ИП Иванова Мария Ивановна" />
          <TextInput label="ИНН" value={s.inn} onChange={f('inn')} inputMode="numeric" />
          <TextInput label="E-mail" type="email" value={s.email} onChange={f('email')} />
        </div>
      </Card>
    </div>
  )
}

function Hero() {
  const { data, set } = useStore()
  const h = data.hero
  const f = (k: keyof typeof h) => (v: string) => set('hero', (d) => void (d[k] = v))
  const shown = data.products.items.filter((p) => p.show !== false)
  return (
    <Card title="Первый экран">
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Заголовок — начало" value={h.title} onChange={f('title')} />
          <TextInput label="Заголовок — золотая часть" value={h.titleAccent} onChange={f('titleAccent')} />
        </div>
        <p className="rounded-xl bg-cream px-4 py-3 font-display text-[22px] font-semibold leading-tight">
          {h.title} <span className="italic text-gold">{h.titleAccent}</span>
        </p>
        <TextArea label="Подзаголовок (главное отличие)" rows={2} value={h.subtitle} onChange={f('subtitle')} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Текст главной кнопки" value={h.quizButton} onChange={f('quizButton')} />
          <Select
            label="Цена на фото первого экрана — какой букет"
            value={h.photoProduct}
            onChange={f('photoProduct')}
            options={shown.map((p) => ({ value: p.id, label: `${p.name} — ${p.price} ₽` }))}
            hint="Само фото первого экрана подобрано по скорости загрузки и меняется в коде"
          />
        </div>
      </div>
    </Card>
  )
}

const TARGETS = [...GALLERY_CATS.filter((c) => c.key !== 'all').map((c) => ({ value: c.key as string, label: `Каталог: ${c.label}` })), { value: 'corporate', label: 'Страница «Компаниям»' }]

function Occasions() {
  const { data, set } = useStore()
  const items = data.occasions.items
  const upd = (i: number, k: keyof (typeof items)[number]) => (v: string) => set('occasions', (d) => void (d.items[i][k] = v))
  const move = (i: number, dir: -1 | 1) =>
    set('occasions', (d) => {
      const [it] = d.items.splice(i, 1)
      d.items.splice(i + dir, 0, it)
    })
  return (
    <div className="grid gap-3">
      {items.map((o, i) => (
        <Card
          key={i}
          title={o.title || 'Новый повод'}
          actions={
            <div className="flex gap-0.5">
              <IconBtn label="Выше" disabled={!i} onClick={() => move(i, -1)}>
                <ArrowUp />
              </IconBtn>
              <IconBtn label="Ниже" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown />
              </IconBtn>
              <IconBtn label="Удалить" onClick={() => set('occasions', (d) => void d.items.splice(i, 1))}>
                <Trash2 />
              </IconBtn>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Повод" value={o.title} onChange={upd(i, 'title')} />
            <TextInput label="Подпись" value={o.text} onChange={upd(i, 'text')} />
            <Select label="Куда ведёт" value={o.target} onChange={upd(i, 'target')} options={TARGETS} />
            <ImageField label="Фото" value={o.image} onChange={upd(i, 'image')} />
          </div>
        </Card>
      ))}
      <Btn icon={<Plus />} onClick={() => set('occasions', (d) => void d.items.push({ title: '', text: '', image: '', target: 'berry' }))}>
        Добавить повод
      </Btn>
    </div>
  )
}

function Seasons() {
  const { data, set } = useStore()
  const list = data.seasons.seasons
  const now = new Date().toISOString().slice(0, 10)
  const upd = (i: number, k: keyof (typeof list)[number]) => (v: string) => set('seasons', (d) => void (d.seasons[i][k] = v))
  return (
    <div className="grid gap-3">
      <p className="text-[14px] text-ink-soft">Полоса под шапкой: показывается в свои даты и сама считает, сколько дней осталось.</p>
      {list.map((s, i) => {
        const active = now >= s.from && now <= s.until
        return (
          <Card
            key={i}
            title={<span className="flex items-center gap-2">{s.text.slice(0, 50) || 'Новый баннер'} {active && <Badge tone="ok">сейчас на сайте</Badge>}</span>}
            actions={
              <IconBtn label="Удалить" onClick={() => set('seasons', (d) => void d.seasons.splice(i, 1))}>
                <Trash2 />
              </IconBtn>
            }
          >
            <div className="grid gap-4 md:grid-cols-4">
              <TextInput className="md:col-span-4" label="Текст" value={s.text} onChange={upd(i, 'text')} />
              <TextInput label="Показывать с" type="date" value={s.from} onChange={upd(i, 'from')} />
              <TextInput label="по" type="date" value={s.until} onChange={upd(i, 'until')} />
              <Select
                className="md:col-span-2"
                label="Куда ведёт"
                value={s.href}
                onChange={upd(i, 'href')}
                options={[
                  { value: '#catalog', label: 'Каталог' },
                  { value: '#hits', label: 'Хит продаж' },
                  { value: 'corporate/', label: 'Страница «Компаниям»' },
                  { value: '#delivery', label: 'Доставка' },
                ]}
              />
            </div>
          </Card>
        )
      })}
      <Btn icon={<Plus />} onClick={() => set('seasons', (d) => void d.seasons.push({ from: now, until: now, text: '', href: '#catalog' }))}>
        Добавить баннер
      </Btn>
    </div>
  )
}

const MSG_LABELS: Record<string, string> = {
  header: 'Кнопка в шапке',
  hero: 'Первый экран',
  mobileBar: 'Нижняя панель на телефоне',
  heroPhoto: '«Пришлю фото примера»',
  custom: '«Не нашли подходящий?»',
  selection: 'Подборка из 3 вариантов',
  howOrder: 'Блок «4 шага»',
  faq: 'Блок вопросов',
  corporate: 'Корпоративный заказ',
  final: 'Свои блоки и прочее',
}

function Messages() {
  const { data, set } = useStore()
  return (
    <Card title="Готовый текст в мессенджере">
      <p className="mb-4 text-[13.5px] text-ink-soft">
        Этот текст подставляется в Telegram, когда посетитель нажимает кнопку. Метка «(с сайта)» добавляется сама — по ней видно заказы с сайта.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.keys(data.messages).map((k) => (
          <TextArea key={k} rows={2} label={MSG_LABELS[k] ?? k} value={data.messages[k]} onChange={(v) => set('messages', (d) => void (d[k] = v))} />
        ))}
      </div>
    </Card>
  )
}
