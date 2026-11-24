import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Btn, Card, Empty, PageHead, Select, TextInput } from '../ui'
import { rub } from '@/lib/utils'

const statuses = [
  { value: 'new', label: 'Новый' }, { value: 'confirmed', label: 'Подтверждён' },
  { value: 'making', label: 'В работе' }, { value: 'ready', label: 'Готов' },
  { value: 'done', label: 'Выдан' }, { value: 'cancelled', label: 'Отменён' },
]
const channels = [{ value: 'telegram', label: 'Telegram' }, { value: 'max', label: 'MAX' }, { value: 'phone', label: 'Телефон' }, { value: 'other', label: 'Другое' }]
const options = [{ value: 'pickup', label: 'Самовывоз' }, { value: 'delivery', label: 'Доставка' }]
const empty = { channel: 'telegram', status: 'new', fulfillment: 'pickup', due_date: '', amount: 0 }
type Order = typeof empty & { id: string; version: number }
type Draft = typeof empty & Partial<Pick<Order, 'id' | 'version'>>

export function Orders({ token }: { token: string | null }) {
  const [items, setItems] = useState<Order[]>([])
  const [offset, setOffset] = useState(0)
  const [more, setMore] = useState(false)
  const [loading, setLoading] = useState(!!token)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const request = useCallback(async (suffix: string, init?: RequestInit) => {
    const response = await fetch(`/api/admin/orders${suffix}`, {
      ...init, cache: 'no-store', headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    })
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Хранилище заказов недоступно на этом адресе.')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Не удалось выполнить запрос.')
    return result
  }, [token])

  const load = useCallback(async (page: number) => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const result = await request(`?offset=${page}`)
      setItems(result.items)
      setOffset(page)
      setMore(result.more)
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [token, request])
  useEffect(() => { void load(0) }, [load])

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft || saving) return
    setSaving(true)
    setError('')
    try {
      await request(draft.id ? `/${draft.id}` : '', { method: draft.id ? 'PATCH' : 'POST', body: JSON.stringify(draft) })
      setDraft(null)
      await load(0)
    } catch (e) { setError((e as Error).message) }
    finally { setSaving(false) }
  }
  const change = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((item) => item && { ...item, [key]: value })

  return <>
    <PageHead title="Заказы" sub="Вносите подтверждённые заявки вручную. Контакты клиента остаются в переписке." actions={token && <>
      <Btn icon={<RefreshCw />} disabled={loading || saving} onClick={() => void load(offset)}>Обновить</Btn>
      <Btn variant="primary" icon={<Plus />} disabled={!!draft || loading} onClick={() => setDraft({ ...empty })}>Новый заказ</Btn>
    </>} />
    {!token ? <Empty>Журнал заказов доступен владельцу после входа.</Empty> : <>
      {error && <p role="alert" className="mb-4 rounded-xl bg-berry/10 p-3 text-sm text-berry">{error}</p>}
      {draft && <Card title={draft.id ? 'Редактировать заказ' : 'Новый заказ'} className="mb-4">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Select label="Канал" value={draft.channel} options={channels} onChange={(v) => change('channel', v)} />
          <Select label="Статус" value={draft.status} options={statuses} onChange={(v) => change('status', v)} />
          <Select label="Получение" value={draft.fulfillment} options={options} onChange={(v) => change('fulfillment', v)} />
          <TextInput label="Дата выдачи" type="date" value={draft.due_date} onChange={(v) => change('due_date', v)} />
          <TextInput label="Сумма, ₽" type="number" min={0} max={10000000} step={1} value={draft.amount} onChange={(v) => change('amount', Number(v))} />
          <div className="flex gap-2 sm:col-span-2"><Btn type="submit" variant="primary" disabled={saving}>Сохранить заказ</Btn><Btn disabled={saving} onClick={() => setDraft(null)}>Отмена</Btn></div>
        </form>
      </Card>}
      {loading && <p role="status" className="text-sm text-muted">Загрузка заказов…</p>}
      {!loading && !items.length && !error && <Empty>Заказов пока нет.</Empty>}
      <ul className="grid gap-2">{items.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface p-3">
        <div><b>Заказ № {item.id.slice(0, 8).toUpperCase()}</b><p className="text-sm text-muted">{statuses.find(({ value }) => value === item.status)?.label} · {item.due_date || 'Дата не задана'} · {rub(item.amount)}</p></div>
        <Btn size="sm" disabled={!!draft || saving} onClick={() => setDraft(item)}>Открыть</Btn>
      </li>)}</ul>
      {(offset > 0 || more) && <div className="mt-3 flex gap-2"><Btn disabled={loading || offset === 0} onClick={() => void load(offset - 50)}>Назад</Btn><Btn disabled={loading || !more} onClick={() => void load(offset + 50)}>Дальше</Btn></div>}
    </>}
  </>
}
