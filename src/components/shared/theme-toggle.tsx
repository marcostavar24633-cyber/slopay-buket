import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from '@/hooks/use-theme'
import { goal } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!dark}
      aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        goal('theme_toggle', { to: dark ? 'light' : 'dark' })
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      className={cn(
        'relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-honey/40 bg-surface text-honey-600 transition hover:border-honey hover:shadow-[0_0_20px_-4px_var(--color-honey)]',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: 18, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid place-items-center"
        >
          {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
