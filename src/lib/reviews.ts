/** Отзывы — из админки (content/reviews.json): лента в блоке отзывов и короткие цитаты на первом экране. */
import { REVIEWS_DATA } from '@/lib/content'

export type Review = { name: string; date: string; item: string; tag?: string; text: string }
export const REVIEWS: Review[] = REVIEWS_DATA.reviews
export const HERO_QUOTES: { name: string; item: string; text: string }[] = REVIEWS_DATA.quotes
