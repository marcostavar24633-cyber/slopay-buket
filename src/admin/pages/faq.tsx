/** Вопросы и ответы: порядок (первые три — самые важные возражения), добавление, правка, удаление. */
import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Btn, Confirm, Empty, IconBtn, Modal, PageHead, SearchInput, TextArea, TextInput } from '../ui'

export function Faq({ params }: { params: URLSearchParams }) {
  const { data, set } = useStore()
  const items = data.faq.items
  const [q, setQ] = useState(params.get('q') ?? '')
  const [edit, setEdit] = useState<{ index: number; q: string; a: string } | null>(null)
  const [del, setDel] = useState<number | null>(null)
  useEffect(() => void (params.get('q') && setQ(params.get('q')!)), [params])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return items.map((f, index) => ({ f, index })).filter(({ f }) => !s || (f.q + ' ' + f.a).toLowerCase().includes(s))
  }, [items, q])
  const move = (i: number, d: -1 | 1) =>
    set('faq', (x) => {
      const [it] = x.items.splice(i, 1)
      x.items.splice(i + d, 0, it)
    })
  const save = () => {
    if (!edit) return
    set('faq', (d) => {
      const it = { q: edit.q.trim(), a: edit.a.trim() }
      if (edit.index < 0) d.items.push(it)
      else d.items[edit.index] = it
    })
    setEdit(null)
  }

  return (
    <>
      <PageHead
        title="Вопросы и ответы"
        sub="Первый вопрос открыт на сайте сразу. Порядок меняется стрелками."
        actions={
          <Btn variant="primary" icon={<Plus />} onClick={() => setEdit({ index: -1, q: '', a: '' })}>
            Добавить вопрос
          </Btn>
        }
      />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-b border-line p-3">
          <SearchInput value={q} onChange={setQ} placeholder="Поиск по вопросам" />
        </div>
        <ol>
          {filtered.map(({ f, index }) => (
            <li key={index} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-honey/12 text-[13px] font-extrabold text-honey-600">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{f.q}</p>
                <p className="mt-0.5 line-clamp-2 text-[13.5px] text-ink-soft">{f.a}</p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-0.5">
                <IconBtn label="Выше" disabled={index === 0 || !!q} onClick={() => move(index, -1)}>
                  <ArrowUp />
                </IconBtn>
                <IconBtn label="Ниже" disabled={index === items.length - 1 || !!q} onClick={() => move(index, 1)}>
                  <ArrowDown />
                </IconBtn>
                <IconBtn label="Редактировать" onClick={() => setEdit({ index, ...f })}>
                  <Pencil />
                </IconBtn>
                <IconBtn label="Удалить" onClick={() => setDel(index)} className="hover:bg-berry/10 hover:text-berry">
                  <Trash2 />
                </IconBtn>
              </div>
            </li>
          ))}
        </ol>
        {!filtered.length && <Empty>Вопросов не найдено.</Empty>}
      </div>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.index === -1 ? 'Новый вопрос' : 'Редактировать вопрос'}
        footer={
          <>
            <Btn onClick={() => setEdit(null)}>Отмена</Btn>
            <Btn variant="primary" onClick={save} disabled={!edit?.q.trim() || !edit?.a.trim()}>
              Сохранить
            </Btn>
          </>
        }
      >
        {edit && (
          <div className="grid gap-4">
            <TextInput label="Вопрос *" value={edit.q} onChange={(v) => setEdit({ ...edit, q: v })} placeholder="Сколько хранится букет?" />
            <TextArea label="Ответ *" rows={5} value={edit.a} onChange={(v) => setEdit({ ...edit, a: v })} hint="Коротко и с цифрами. Ответы видят и поисковики." />
          </div>
        )}
      </Modal>
      <Confirm text={del !== null ? `Удалить вопрос «${items[del]?.q}»?` : null} onYes={() => del !== null && set('faq', (d) => void d.items.splice(del, 1))} onClose={() => setDel(null)} />
    </>
  )
}
