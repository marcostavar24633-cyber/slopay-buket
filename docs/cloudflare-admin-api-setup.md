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
| `GITHUB_TOKEN` | Secret | Fine-grained token только для репозитория `marcostavar24633-cyber/slopay-buket`, Contents: Read and write |

Токен не добавлять в `wrangler.jsonc`, исходники, GitHub Actions variables с открытым выводом, браузер или URL. Использовать только Worker Secret.

Для GitHub token не выдавать Administration, Workflows или другие права, пока отдельная функция не потребует их. Для текущего чтения/записи JSON достаточно Contents: Read and write.

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
- Загрузка изображений намеренно отключена в новом клиенте до реализации отдельного защищённого endpoint. Старый прямой GitHub upload из браузера удалён.
- Статус GitHub Actions/Cloudflare deployments пока не подключён. Интерфейс должен показывать ошибку отсутствующего API, а не выдавать пустой список за успешную проверку.
- Worker проверяет, что корень JSON — объект, и ограничивает размер payload. Строгая проверка схемы каждого из девяти JSON-файлов ещё требуется.
- Настройки Access и Worker Secrets в Cloudflare Dashboard не создаются коммитом в GitHub. Их необходимо настроить вручную.
- Защитите Access application путями `/admin/*` и `/api/*`, разрешив вход только своему административному identity.
- Не переносите Worker на production и не меняйте `GITHUB_BRANCH` на `main`, пока тестирование не завершено.

## 5. Следующий этап разработки

1. Добавить строгую schema validation для каждого из девяти JSON-файлов.
2. Реализовать защищённую загрузку изображений с проверкой MIME, размера и допустимого пути.
3. Подключить реальный статус сборок/публикаций или явно обозначить этот модуль как неподключённый.
4. Добавить тесты чтения/записи, неверной схемы, конфликтов SHA и отказа без Access.
5. Выполнить сборку и тесты проекта, затем открыть отдельный pull request для проверки.
6. После успешной проверки отдельно спланировать выпуск из тестовой ветки в `main`.
