# Настройка защищённого Admin API в Cloudflare

Документ относится к ветке `feature/admin-pro-foundation`. Пока настройки не выполнены, новый API намеренно работает в fail-closed режиме и не должен считаться готовым к эксплуатации.

## 1. Создать Cloudflare Access application

В Zero Trust → Access → Applications создайте Self-hosted application для домена сайта.

Добавьте отдельные защищённые пути:
- `/admin/*`
- `/api/*`

Политика должна разрешать доступ только вашему административному email/identity. Не создавайте политику Allow для всех пользователей.

Сохраните **Application Audience (AUD) Tag** приложения, которое защищает API.

## 2. Добавить переменные Worker

В настройках Worker `slopay-buket` → Settings → Variables and Secrets добавьте:

| Имя | Тип | Значение |
|---|---|---|
| `ACCESS_TEAM_DOMAIN` | Variable | домен вашей команды Access, например `example.cloudflareaccess.com`, без https:// |
| `ACCESS_AUD` | Variable | Audience Tag приложения Access, защищающего `/api/*` |
| `GITHUB_TOKEN` | Secret | Fine-grained token только для репозитория `marcostavar24633-cyber/slopay-buket`, Contents: Read and write; Actions: Read-only |

Токен не добавлять в `wrangler.jsonc`, исходники, GitHub Actions variables с открытым выводом, браузер или URL. Использовать только Worker Secret.

Для GitHub token выдайте только Contents: Read and write и Actions: Read-only (последнее нужно для списка запусков GitHub Actions). Не выдавайте Administration или Actions: Read and write.

## 3. Проверка до включения в production

После настройки переменных и Access:

1. Запрос `GET /api/health` без Access-сессии должен вернуть 401.
2. Запрос из чужого Origin должен вернуть 403.
3. Запрос `GET /api/session` из разрешённой Access-сессии должен вернуть `authenticated: true`.
4. `GET /api/content/site` должен вернуть JSON и SHA.
5. Проверить сохранение только на тестовой ветке, не на `main`.
6. Проверить конфликт SHA: старый SHA должен вернуть 409, а не затереть более новые данные.
7. Проверить, что GitHub token отсутствует в DevTools → Network, Local Storage, Session Storage и исходниках собранного сайта.

## 4. Важные ограничения текущего этапа

- Клиент админки переведён на same-origin Worker API: GitHub token больше не запрашивается и не хранится в браузере.
- Worker API и клиент пока работают с веткой `feature/admin-pro-foundation`. Это изолированная тестовая ветка; публикация в `main` не выполняется.
- Загрузка изображений доступна через защищённый `POST /api/uploads`: клиент преобразует JPG/PNG/WebP/GIF в WebP, Worker проверяет сигнатуру и размер (до 8 МБ), файл записывается в `public/img/uploads/` тестовой ветки. Старый прямой GitHub upload из браузера удалён.
- `GET /api/deploys` возвращает до 10 последних запусков GitHub Actions для тестовой ветки. Это статус workflow GitHub, а не подтверждение доступности Cloudflare production deployment.
- Worker проверяет структуру всех девяти JSON-файлов и ограничивает размер JSON payload 1 МБ.
- Настройки Access и Worker Secrets в Cloudflare Dashboard не создаются коммитом в GitHub. Их необходимо настроить вручную.
- Защитите Access application путями `/admin/*` и `/api/*`, разрешив вход только своему административному identity.
- Не переносите Worker на production и не меняйте `GITHUB_BRANCH` на `main`, пока тестирование не завершено.

## 5. Следующий этап разработки

1. Настроить Cloudflare Access и Worker Secrets.
2. Проверить API чтения/записи, конфликт SHA, загрузку WebP и статус GitHub Actions в реальном окружении.
3. Добавить/выполнить интеграционные тесты API с тестовым JWT и GitHub API mock.
4. Проверить совместимость визуального редактора с redesign.
5. После полного тестирования отдельно спланировать выпуск из тестовой ветки в `main`.
