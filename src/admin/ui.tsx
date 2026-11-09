/** Общие элементы интерфейса админки: кнопки, поля, переключатели, модальное окно, таблица, загрузка фото. */
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { previewSrc, useStore } from './store'

/* ───────── Кнопки ───────── */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' | 'danger'; size?: 'sm' | 'md'; icon?: ReactNode }
export function Btn({ variant = 'outline', size = 'md', icon, className, children, ...p }: BtnProps) {
  return (
    <button
      type="button"
      {...p}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-honey/30 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
        size === 'sm' ? 'h-9 px-3 text-[13px]' : 'h-11 px-4 text-[14px]',
        variant === 'primary' && 'bg-gold font-bold text-onaccent hover:brightness-105',
        variant === 'outline' && 'border border-line bg-surface text-ink hover:border-honey/50',
        variant === 'ghost' && 'text-ink-soft hover:bg-ink/5 hover:text-ink',
        variant === 'danger' && 'bg-berry text-white hover:brightness-110',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconBtn({ label, children, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...p}
      className={cn('grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-ink-soft transition hover:bg-ink/5 hover:text-ink disabled:opacity-30 [&_svg]:h-4 [&_svg]:w-4', className)}
    >
      {children}
    </button>
  )
}

/* ───────── Поля формы ───────── */
const fieldCls =
  'w-full rounded-xl border border-line bg-cream px-3.5 text-[14.5px] text-ink placeholder:text-muted outline-none transition focus:border-honey focus:ring-4 focus:ring-honey/15'

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: (id: string) => ReactNode; className?: string }) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-bold text-ink-soft">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{hint}</p>}
    </div>
  )
}

export function TextInput({ label, hint, value, onChange, className, ...p }: { label: string; hint?: ReactNode; value: string | number | undefined; onChange: (v: string) => void; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => <input id={id} {...p} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cn(fieldCls, 'h-11')} />}
    </Field>
  )
}

export function TextArea({ label, hint, value, onChange, rows = 4, className }: { label: string; hint?: ReactNode; value: string | undefined; onChange: (v: string) => void; rows?: number; className?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => <textarea id={id} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cn(fieldCls, 'resize-y py-2.5 leading-relaxed')} />}
    </Field>
  )
}

export function Select<T extends string>({ label, hint, value, onChange, options, className }: { label: string; hint?: ReactNode; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={cn(fieldCls, 'h-11 cursor-pointer')}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

/** Переключатель «вкл/выкл» */
export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label?: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition', checked ? 'bg-honey' : 'bg-ink/20')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
      {label && (
        <span>
          <span className="block text-[14px] font-semibold">{label}</span>
          {hint && <span className="block text-[12.5px] text-muted">{hint}</span>}
        </span>
      )}
    </label>
  )
}

/** Метка-статус в таблицах */
export function Badge({ tone = 'muted', children }: { tone?: 'ok' | 'gold' | 'muted' | 'danger'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold',
        tone === 'ok' && 'bg-leaf/15 text-leaf',
        tone === 'gold' && 'bg-honey/15 text-honey-600',
        tone === 'muted' && 'bg-ink/8 text-muted',
        tone === 'danger' && 'bg-berry/15 text-berry',
      )}
    >
      {children}
    </span>
  )
}

/* ───────── Модальное окно ───────── */
export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        'm-auto max-h-[92dvh] w-[calc(100%-24px)] overflow-hidden rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        wide ? 'max-w-3xl' : 'max-w-xl',
      )}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-[18px] font-extrabold">{title}</h2>
            <IconBtn label="Закрыть" onClick={onClose}>
              <X />
            </IconBtn>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}

/** Подтверждение удаления */
export function Confirm({ text, onYes, onClose }: { text: string | null; onYes: () => void; onClose: () => void }) {
  return (
    <Modal
      open={!!text}
      onClose={onClose}
      title="Удалить?"
      footer={
        <>
          <Btn onClick={onClose}>Отмена</Btn>
          <Btn
            variant="danger"
            onClick={() => {
              onYes()
              onClose()
            }}
          >
            Удалить
          </Btn>
        </>
      }
    >
      <p className="text-[15px] text-ink-soft">{text}</p>
      <p className="mt-2 text-[13px] text-muted">Удаление попадёт на сайт после «Опубликовать». До этого его можно отменить кнопкой «Отменить правки».</p>
    </Modal>
  )
}

/* ───────── Фото: превью, загрузка, путь ───────── */
export function ImageField({ label, value, onChange, hint }: { label: string; value: string | undefined; onChange: (v: string) => void; hint?: string }) {
  const { upload, toast } = useStore()
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const pick = async (f?: File) => {
    if (!f) return
    if (!f.type.startsWith('image/')) return toast('Нужен файл-картинка (JPG, PNG, WebP, HEIC не поддерживается)', 'error')
    setBusy(true)
    try {
      onChange(await upload(f))
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-bold text-ink-soft">{label}</p>
      <div
        className="flex items-center gap-3 rounded-2xl border border-dashed border-line bg-cream p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          pick(e.dataTransfer.files[0])
        }}
      >
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2">
          {busy ? <Loader2 className="h-5 w-5 animate-spin text-honey" /> : value ? <img src={previewSrc(value)} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-muted" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <Btn size="sm" onClick={() => input.current?.click()} disabled={busy} icon={<ImagePlus />}>
              {value ? 'Заменить фото' : 'Загрузить фото'}
            </Btn>
            {value && (
              <Btn size="sm" variant="ghost" onClick={() => onChange('')}>
                Убрать
              </Btn>
            )}
          </div>
          <p className="mt-1.5 truncate text-[12px] text-muted">{value || hint || 'Перетащите фото сюда или нажмите «Загрузить». Сожмём до 1600 px автоматически.'}</p>
        </div>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0] ?? undefined)} />
      </div>
    </div>
  )
}

/* ───────── Страница и карточки ───────── */
export function PageHead({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-7">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight md:text-[28px]">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-ink-soft">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-line bg-surface', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 md:px-5">
          <h2 className="text-[15px] font-extrabold">{title}</h2>
          {actions}
        </header>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </section>
  )
}

/** Поиск + фильтры над таблицей */
export function SearchInput({ value, onChange, placeholder = 'Поиск…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={cn(fieldCls, 'h-10 min-w-0 basis-full sm:basis-auto sm:flex-1 sm:max-w-xs')}
    />
  )
}

export function FilterSelect<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)} className={cn(fieldCls, 'h-10 w-auto cursor-pointer')}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-[14px] text-muted">{children}</p>
}

/** Переключатель страниц таблицы */
export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[13px] text-muted">
      <span>
        Страница {page + 1} из {pages}
      </span>
      <div className="flex gap-2">
        <Btn size="sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
          Назад
        </Btn>
        <Btn size="sm" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          Дальше
        </Btn>
      </div>
    </div>
  )
}
