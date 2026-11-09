/**
 * Мини-разметка для текстов из админки (без внешних библиотек и без HTML):
 * пустая строка — новый абзац, «- » — пункт списка, **жирный**, *курсив*, [текст](ссылка).
 */
import type { ReactNode } from 'react'

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const k = `${key}-${i++}`
    if (m[1]) out.push(<b key={k}>{m[1]}</b>)
    else if (m[2]) out.push(<em key={k}>{m[2]}</em>)
    else {
      const href = /^(https?:|tel:|#|\/)/.test(m[4]) ? m[4] : '#'
      const ext = href.startsWith('http')
      out.push(
        <a key={k} href={href} className="font-semibold text-honey-600 underline underline-offset-2" {...(ext ? { target: '_blank', rel: 'noopener' } : {})}>
          {m[3]}
        </a>,
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ text, className }: { text?: string; className?: string }) {
  if (!text?.trim()) return null
  const parts = text.replace(/\r/g, '').split(/\n{2,}/)
  return (
    <div className={className}>
      {parts.map((p, i) => {
        const lines = p.split('\n')
        if (lines.every((l) => /^\s*[-•]\s+/.test(l)))
          return (
            <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 first:mt-0 marker:text-honey">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ''), `${i}-${j}`)}</li>
              ))}
            </ul>
          )
        return (
          <p key={i} className="mt-3 first:mt-0">
            {lines.flatMap((l, j) => (j ? [<br key={`br${j}`} />, ...inline(l, `${i}-${j}`)] : inline(l, `${i}-${j}`)))}
          </p>
        )
      })}
    </div>
  )
}
