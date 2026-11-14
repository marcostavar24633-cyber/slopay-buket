/** Дашборд: 4 ключевые цифры, график по категориям, обновления сайта и быстрые действия. */
import { BarChart3, CheckCircle2, ExternalLink, Layers, Loader2, MessageSquareQuote, Package, Plus, Wallet, XCircle } from 'lucide-react'
import { GALLERY_CATS } from '@/lib/gallery'
import { rub } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Route } from '../layout'
import { useStore } from '../store'
import { Btn, Card, PageHead } from '../ui'

const CAT_NAMES = Object.fromEntries(GALLERY_CATS.filter((c) => c.key !== 'all').map((c) => [c.key, c.label]))

export function Dashboard({ go }: { go: (r: Route, q?: Record<string, string>) => void }) {
  const { data, deploys, deployError, mode } = useStore()
  const all = data.products.items
  const shown = all.filter((p) => p.show !== false)
  const prices = shown.map((p) => Number(p.price) || 0).filter(Boolean)
  const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length / 10) * 10 : 0
  const blocks = data.page.blocks
  const KPI = [
    { icon: Package, label: 'Товаров на сайте', value: String(shown.length), sub: `из ${all.length} фото · хитов: ${shown.filter((p) => p.hit).length}`, to: 'products' as Route },
    { icon: Wallet, label: 'Средняя цена', value: rub(avg), sub: prices.length ? `от ${rub(Math.min(...prices))} до ${rub(Math.max(...prices))}` : '—', to: 'products' as Route },
    { icon: MessageSquareQuote, label: 'Отзывы', value: `${data.site.rating} ★`, sub: `${data.site.reviewsCount} на ${data.site.reviewsSource} · в ленте ${data.reviews.reviews.length}`, to: 'reviews' as Route },
    { icon: Layers, label: 'Блоков на странице', value: String(blocks.filter((b) => b.show !== false).length), sub: `всего ${blocks.length}, скрыто ${blocks.filter((b) => b.show === false).length}`, to: 'blocks' as Route },
  ]

  // данные для графика: сколько работ и средняя цена по категориям
  const cats = Object.keys(CAT_NAMES)
    .map((c) => {
      const items = shown.filter((p) => p.cat === c)
      return { key: c, label: CAT_NAMES[c], count: items.length, avg: items.length ? Math.round(items.reduce((a, p) => a + Number(p.price), 0) / items.length) : 0 }
    })
    .filter((c) => c.count)
  const max = Math.max(1, ...cats.map((c) => c.count))

  return (
    <>
      <PageHead
        title="Дашборд"
        sub={mode === 'demo' ? 'Демо-режим: данные из текущей версии сайта, сохранение выключено.' : 'Что сейчас на сайте и что стоит сделать.'}
        actions={
          <a href="https://metrika.yandex.ru/dashboard?id=114134059" target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-[14px] font-semibold hover:border-honey/50">
            <BarChart3 className="h-4 w-4" /> Яндекс Метрика <ExternalLink className="h-3.5 w-3.5 text-muted" />
          </a>
        }
      />

      {/* KPI-карточки */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI.map((k) => (
          <button key={k.label} onClick={() => go(k.to)} className="cursor-pointer rounded-2xl border border-line bg-surface p-4 text-left transition hover:border-honey/50 md:p-5">
            <span className="flex items-center justify-between text-[13px] font-semibold text-ink-soft">
              {k.label}
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-honey/12 text-honey-600">
                <k.icon className="h-4 w-4" />
              </span>
            </span>
            <b className="mt-2 block text-[24px] font-extrabold tracking-tight md:text-[30px]">{k.value}</b>
            <span className="mt-1 block text-[12px] leading-snug text-muted">{k.sub}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* График: SVG без библиотек */}
        <Card title="Работы в каталоге по категориям">
          <svg viewBox={`0 0 600 ${cats.length * 46 + 10}`} className="w-full" role="img" aria-label="Количество работ и средняя цена по категориям">
            {cats.map((c, i) => {
              const w = (c.count / max) * 330
              const y = i * 46 + 6
              return (
                <g key={c.key}>
                  <text x="0" y={y + 22} fontSize="14" fontWeight="600" className="fill-ink-soft">
                    {c.label.length > 22 ? c.label.slice(0, 21) + '…' : c.label}
                  </text>
                  <rect x="190" y={y + 6} width="340" height="24" rx="8" className="fill-ink/5" />
                  <rect x="190" y={y + 6} width={Math.max(w, 6)} height="24" rx="8" className="fill-honey" />
                  <text x={196 + Math.max(w, 6)} y={y + 23} fontSize="13" fontWeight="800" className="fill-ink">
                    {c.count}
                  </text>
                  <text x="600" y={y + 23} fontSize="12" textAnchor="end" className="fill-muted">
                    ~{Math.round(c.avg / 100) / 10} т.₽
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="mt-2 text-[12px] text-muted">Полоса — число работ на сайте, справа — средняя цена в тысячах рублей.</p>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Быстрые действия">
            <div className="grid gap-2">
              <Btn variant="primary" onClick={() => go('editor')} className="justify-start">
                Открыть визуальный редактор
              </Btn>
              <Btn onClick={() => go('products', { new: '1' })} icon={<Plus />} className="justify-start">
                Добавить товар
              </Btn>
              <Btn onClick={() => go('blocks', { new: '1' })} icon={<Plus />} className="justify-start">
                Добавить блок на страницу
              </Btn>
              <Btn onClick={() => go('settings')} className="justify-start">
                Изменить название, контакты, первый экран
              </Btn>
            </div>
          </Card>
          <Card title="Обновления сайта">
            {mode === 'demo' ? (
              <p className="text-[13.5px] text-muted">После входа здесь видно, когда сайт пересобрался после ваших правок.</p>
            ) : (
              <div className="space-y-3">
                {deployError && (
                  <p role="alert" className="rounded-xl border border-berry/30 bg-berry/10 px-3 py-2 text-[13px] text-berry">
                    {deployError}
                  </p>
                )}
                {deploys.length ? (
                  <ul className="space-y-2.5">
                    {deploys.slice(0, 5).map((d) => (
                      <li key={d.id}>
                        <a href={d.url} target="_blank" rel="noopener" className="flex items-start gap-2.5 text-[13.5px] hover:text-honey-600">
                          {d.status !== 'completed' ? (
                            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-honey" />
                          ) : d.conclusion === 'success' ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-berry" />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{d.title}</span>
                            <span className={cn('block text-[12px]', d.conclusion === 'failure' ? 'text-berry' : 'text-muted')}>
                              {new Date(d.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} ·{' '}
                              {d.status !== 'completed' ? 'обновляется' : d.conclusion === 'success' ? 'на сайте' : 'не удалось'}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : !deployError ? (
                  <p className="text-[13.5px] text-muted">Нет данных. Дайте ключу право «Actions: Read-only», чтобы видеть статус.</p>
                ) : null}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
