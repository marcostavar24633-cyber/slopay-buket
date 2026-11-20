// «Слопай букет» — component props, copied from the repository (main@dcc3f27) as documentation.
import type * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'dark' | 'max' | 'tg' | 'tgOutline' | 'ghost' | 'link' | 'light'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  /** render the child element (e.g. <a>) with button styles */
  asChild?: boolean
}
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { dark?: boolean }
export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (v: string) => void
  dark?: boolean
}
export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>
export interface CheckboxProps {
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
  dark?: boolean
  className?: string
}
export interface ChipsProps<T extends string = string> {
  options: readonly { key: T; label: string }[]
  value: T | null
  onChange: (v: T) => void
  dark?: boolean
  className?: string
  ariaLabel?: string
}
/** Radix Accordion: Accordion (Root), AccordionItem, AccordionTrigger, AccordionContent */
export interface AccordionProps { type: 'single' | 'multiple'; collapsible?: boolean; children: React.ReactNode }
export interface SectionTitleProps {
  eyebrow?: string
  title: React.ReactNode
  sub?: React.ReactNode
  center?: boolean
  dark?: boolean
  className?: string
}
export interface MessengerButtonsProps {
  text: string | (() => string)
  from: string
  className?: string
  size?: 'md' | 'lg'
  row?: boolean
  /** called before navigating; return false to cancel */
  onBefore?: () => boolean | void
}
export interface StatusPillProps { className?: string; compact?: boolean }
