# «Слопай букет» — лендинг съедобных букетов (Ульяновск)

Vite + React 18 + TypeScript + Tailwind v4. UI-примитивы в стиле **shadcn/ui** (Radix: Accordion, Dialog, Slot; Vaul — шторка),
анимационные компоненты по мотивам **Magic UI** (`Marquee`, `NumberTicker`, `ShimmerButton`, `BlurFade`, `BorderBeam`)
и **Aceternity UI** (`Spotlight`, `CardSpotlight`). Фото сгенерированы в Figma AI и сжаты в WebP (34–130 КБ).

```bash
npm i
npm run dev            # разработка
npm run build          # сборка в dist/
npm run preview        # http://localhost:4173
npm run test:e2e       # 14 E2E-сценариев Playwright (нужен запущенный preview)
npm run test:unit      # маска телефона
```

## Что заменить перед запуском

| Где | Что |
|---|---|
| `src/lib/config.ts` | телефон, WhatsApp-номер, Telegram, адрес, ИП/ИНН, рейтинг, цифры отзывов, дедлайн «на сегодня» (17:00) |
| `src/lib/products.ts` | букеты, цены S/M/L, состав, фото, фильтры, допродажи |
| `public/img/*` | **реальные фото** — сгенерированные только для макета. Обязательно «букет в руках» для каждой позиции |
| `src/components/sections/reviews.tsx` | реальные отзывы, видео-реакции (`video: '/video/x.mp4'`), ссылка на Яндекс Карты |
| `src/components/sections/corporate.tsx` | логотипы клиентов (с разрешения) — сейчас заглушки со звёздочкой |
| `src/lib/analytics.ts` | ID Яндекс Метрики (+ счётчик в `index.html`) |
| `public/corporate-catalog.pdf` | заглушка; пересобрать: `npm run pdf` |
| `/privacy`, `/oferta` | страницы политики и оферты (ссылки уже стоят) |

## Заявки → Telegram-бот

Все формы вызывают `submitLead()` (`src/lib/leads.ts`) с полем `source` (из какой формы) и `product`.
Пример серверной функции — `api/lead.ts`: задайте `TG_BOT_TOKEN`, `TG_CHAT_ID` на хостинге и `VITE_LEAD_ENDPOINT=/api/lead` при сборке.
Без эндпоинта заявки пишутся в консоль (dev).

## Цели Метрики (уже расставлены)

`cta_header`, `cta_hero_catalog`, `cta_hero_quiz`, `wa_click{from}`, `tg_click{from}`, `phone_click{from}`, `order_open`,
`catalog_filter`, `quiz_step{step}`, `quiz_complete`, `quiz_to_corporate`, `lead_<source>`, `upsell_added`, `thanks_screen`,
`exit_popup_show`, `corp_pdf_download`, `yandex_reviews_click`, `season_bar_click`.

У каждой WA-кнопки свой предзаполненный текст (`WA` в `config.ts`) — видно, какая кнопка приводит клиентов.

## A/B и сезонность

- Заголовок: `?h=b` — вариант B («Подарок, который не завянет…»), по умолчанию A (поисковый).
- Сезонная полоса над шапкой и вкладка «🎄 Новый год» — `SeasonBar` в `header.tsx`, `RECIPIENT_TABS` в `products.ts`.
- В ноябре–декабре `<Corporate/>` можно поднять сразу после `<Catalog/>` в `App.tsx`.
- Время «до 17:00» считается по Ульяновску (UTC+4), независимо от пояса посетителя.

## Свои фото

```bash
npm run photos -- "C:\Users\Имя\Desktop\Букеты"
```

Скрипт берёт все JPG/PNG/WebP из папки (включая подпапки), поворачивает по EXIF, уменьшает до 1200 px,
сжимает в WebP и кладёт в `public/img/real/` с латинскими именами + `manifest.json` со списком путей.
Дальше путь вида `/img/real/klubnichnyy-buket.webp` вставляется в `src/lib/products.ts` (поля `image` и `inHands`).

## Галерея реальных работ

Фото лежат в `public/img/real/<категория>/` (полные 1100 px) и `.../thumbs/` (миниатюры 440 px).
Данные галереи (`src/lib/gallery.ts`) генерируются — руками не править. Добавить новые фото:

```bash
npm run photos -- "папка/с/фото" --out public/img/real/berry --width 1100
npm run photos -- "папка/с/фото" --out public/img/real/berry/thumbs --width 440
mv public/img/real/berry/manifest.json scripts/manifests/berry.json
npm run gallery
```

Новая категория — добавьте строку в `CATS` в `scripts/build-gallery.mjs`.
