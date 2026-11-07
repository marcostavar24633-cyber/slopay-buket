import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const rub = (n: number) => `${n.toLocaleString('ru-RU').replace(/,/g, ' ')} ₽`
