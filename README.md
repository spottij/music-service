# Wavebox

Учебный музыкальный сервис с поиском по открытым источникам и YouTube.

Проект сделан как практическая работа: без сложной инфраструктуры, но с
понятной архитектурой, отдельными провайдерами поиска и рабочим интерфейсом.

## Текущий стек

- Frontend: HTML + CSS + JavaScript без сборщика.
- Backend: Node.js, встроенный `http` server.
- Providers: YouTube, Internet Archive audio и Audius API.
- Desktop/Android упаковка: будет добавлена отдельными шагами.

## Что уже работает

- Поиск треков через `/api/v1/search`.
- Нормализация результатов от разных провайдеров.
- YouTube-поиск через `YOUTUBE_API_KEY` или Invidious fallback.
- YouTube embed-плеер для YouTube-результатов.
- Audio-плеер для прямых `streamUrl`.
- Ссылка на страницу источника.

## Структура

```text
apps/
  api/                 Backend-приложение
  web/                 Frontend-приложение
packages/
  shared/              Общие функции
  providers/           Адаптеры музыкальных API
docs/
  architecture.md      Общая архитектура
  api.md               HTTP API
  database.md          Модель данных на будущее
  providers.md         Источники поиска и воспроизведения
```

## Запуск

```bash
node apps/api/src/server.js
```

После запуска открой:

```text
http://localhost:3000
```

## YouTube API

Для лучшего покрытия треков нужен ключ YouTube Data API:

```bash
set YOUTUBE_API_KEY=your_key_here
node apps/api/src/server.js
```

Если ключ не задан, backend пробует публичные Invidious-compatible endpoints.
Они удобны для разработки, но могут быть медленными или временно недоступными.

## Проверка

```bash
node --check apps/api/src/server.js
node --check packages/providers/src/index.js
node --check packages/providers/src/internetArchive.js
node --check packages/providers/src/audius.js
node --check packages/providers/src/youtube.js
node --check packages/shared/src/track.js
node --check apps/web/src/app.js
```
