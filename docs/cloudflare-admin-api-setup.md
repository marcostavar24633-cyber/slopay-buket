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

- Текущий клиент админки всё ещё использует старый `src/admin/github.ts` и прямой GitHub token. Пока клиент не мигрирован, не считайте новую схему завершённой и не открывайте старый вход в production для посторонних.
- Worker API сейчас проверяет Access JWT и allowlist ключей, но строгая валидация отдельных JSON-схем будет добавлена отдельным этапом.
- API записи сейчас сохраняет файлы в `main`. До миграции клиентского приложения и добавления безопасного выбора целевой ветки не выполнять тестовые PUT-запросы к production-данным.
- Настройка Access в панели Cloudflare не выполняется автоматически коммитом в GitHub. Её нужно применить в Cloudflare Dashboard.
- Статические файлы `/admin/*` должны быть закрыты Access application, а не только API-маршруты.

## 5. Следующий этап разработки

1. Добавить в Worker поддержку конфигурируемой тестовой ветки/окружения.
2. Ввести schema validation для каждого из девяти JSON-файлов.
3. Перевести `src/admin/github.ts` на same-origin Worker API и полностью удалить клиентский token flow.
4. Перевести загрузку и сохранение в StoreProvider.
5. Добавить интеграционные тесты чтения, записи, неверной схемы и конфликтов.
6. Только после этого подключать UI к новому backend.
