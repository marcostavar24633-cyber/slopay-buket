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

## Перед запуском: что заполнить

Почти всё — в одном файле `src/lib/config.ts`.

| Что | Где | Зачем |
|---|---|---|
| **Ссылка на MAX** | `config.ts` → `maxUrl` (MAX → Профиль → «Поделиться») | главная кнопка сайта; сейчас ведёт на max.ru |
| **Ссылка на профиль Авито** | `config.ts` → `reviewsUrl` | кнопка «Все отзывы на Авито» |
| **ФИО и ИНН продавца, e-mail** | `config.ts` → `ownerName`, `inn`, `email` | закон о защите прав потребителей; подставятся в подвал, политику и оферту |
| **Адрес сайта** | `config.ts` → `url` | sitemap.xml, robots.txt, превью ссылок |
| **Заявки в Telegram** | см. ниже | без этого формы показывают «Спасибо», но заявка никуда не уходит |
| **Яндекс Метрика** | `src/lib/analytics.ts` → `YM_ID` + код счётчика в `index.html` | статистика и цели |
| Цены, составы, названия | `src/lib/products.ts` | сейчас черновик по фото |
| Часы работы, зоны и цены доставки | `config.ts`, `src/components/sections/delivery.tsx` | сейчас примерные |
| Группа ВКонтакте | `config.ts` → `vk` (пусто — иконка скрыта) | |

Юридические тексты (`src/legal.tsx` → страницы `/privacy/` и `/oferta/`) — шаблоны. Незаполненные реквизиты подсвечены на страницах; перед запуском покажите тексты юристу.

## Заявки → Telegram-бот

1. В Telegram откройте **@BotFather** → `/newbot` → придумайте имя → получите **токен** вида `123456:ABC…`.
2. Напишите своему боту любое сообщение, затем откройте `https://api.telegram.org/bot<ТОКЕН>/getUpdates` — в ответе найдите `"chat":{"id": …}` — это **TG_CHAT_ID**.
3. Зайдите на **vercel.com** через GitHub → **Add New → Project** → выберите репозиторий `slopay-buket` → в **Environment Variables** добавьте `TG_BOT_TOKEN` и `TG_CHAT_ID` → **Deploy**. Функция `api/lead.ts` заработает по адресу `https://<проект>.vercel.app/api/lead`.
4. На GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**: имя `LEAD_ENDPOINT`, значение — адрес из шага 3. Затем **Actions → GitHub Pages → Run workflow** — сайт пересоберётся и начнёт слать заявки в бот.
5. По желанию в Vercel добавьте `ALLOWED_ORIGIN=https://<логин>.github.io` — тогда заявки будут приниматься только с вашего сайта.

Все формы вызывают `submitLead()` (`src/lib/leads.ts`) с полем `source` (из какой формы) и названием букета. **Токен бота на сайт не кладите** — только в переменные хостинга.

## Сборка и размещение

```bash
npm install
npm run build      # готовый сайт — в папке dist/
```

`dist/` — обычные статические файлы: главная, `privacy/`, `oferta/`, `robots.txt`, `sitemap.xml`, `og-image.jpg`, видео и фото. Подходит любой хостинг статики (Timeweb, Beget, Reg.ru, Vercel, Netlify). Включите HTTPS (бесплатный сертификат Let's Encrypt есть у всех перечисленных).

### GitHub Pages (бесплатно)

Файл `.github/workflows/pages.yml` сам собирает и публикует сайт при каждом сохранении в `main`.
Включить один раз: репозиторий → **Settings → Pages → Source: GitHub Actions**. Адрес: `https://<логин>.github.io/<репозиторий>/`.
Пути к фото и видео подстраиваются под подпапку автоматически (плагин `basePaths` в `vite.config.ts`).
Pages на бесплатном тарифе работает только для публичных репозиториев.

Картинка для превью ссылок пересобирается командой `node scripts/og-image.cjs [фото]`.

## Скрытые фото

Фото, где видны бутылки или банки с алкоголем, не показываются на сайте — список `HIDDEN` в `src/lib/products.ts`. Файлы не удалены: чтобы вернуть фото, уберите его из списка.

## Цели Метрики (уже расставлены)

`cta_header`, `cta_hero_catalog`, `cta_hero_quiz`, `max_click{from}`, `tg_click{from}`, `phone_click{from}`, `order_open`,
`catalog_filter`, `quiz_step{step}`, `quiz_complete`, `quiz_to_corporate`, `lead_<source>`, `thanks_screen`,
`corp_pdf_download`, `yandex_reviews_click`.

У каждой MSG-кнопки свой предзаполненный текст (`MSG` в `config.ts`) — видно, какая кнопка приводит клиентов.

## A/B и сезонность

- Заголовок: `?h=b` — вариант B («Подарок, который не завянет…»), по умолчанию A (поисковый).
- Вкладка «🎄 Новый год» — `RECIPIENT_TABS` в `products.ts`. Отзывы — `src/lib/reviews.ts` (цитаты для карточки на первом экране — `HERO_QUOTES`).
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
