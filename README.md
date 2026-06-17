# Open Music Service

Учебный музыкальный сервис с поиском полных треков по открытым API.

Текущий прототип не пытается обходить ограничения коммерческих каталогов и не
использует 30-секундные фрагменты. В выдачу попадают только записи, для которых
открытый источник отдает полноценный аудиофайл.

## Текущий стек

- Frontend: HTML + CSS + JavaScript без сборщика.
- Backend: Node.js, встроенный `http` server.
- Providers: Internet Archive audio и Audius API.
- Database: PostgreSQL запланирован на следующий этап.
- Auth: JWT access/refresh tokens запланированы на следующий этап.

Такой стек выбран для первого прототипа, потому что он запускается одной
командой и не требует установки npm-пакетов.

## Что уже работает

- Поиск треков через `/api/v1/search`.
- Нормализация результатов от провайдеров.
- Фильтрация: только треки с полным `streamUrl`.
- Веб-интерфейс со списком результатов.
- Audio-плеер для полного трека.
- Ссылка на страницу источника.

## Структура

```text
apps/
  api/                 Backend-приложение
  web/                 Frontend-приложение
packages/
  shared/              Общие функции
  providers/           Адаптеры открытых музыкальных API
docs/
  architecture.md      Общая архитектура
  api.md               Черновик HTTP API
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

## Проверка

```bash
node --check apps/api/src/server.js
node --check packages/providers/src/index.js
node --check packages/providers/src/internetArchive.js
node --check packages/providers/src/audius.js
node --check packages/shared/src/track.js
node --check apps/web/src/app.js
```

## Ближайшие этапы

1. Добавить PostgreSQL и сохранение найденных треков.
2. Добавить пользователей, избранное и плейлисты.
3. Улучшить скорость поиска через кэширование metadata-запросов.
4. Добавить историю прослушивания.
5. Перейти на React + TypeScript, если интерфейс начнет расти.
