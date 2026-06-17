# Архитектура

## Цель

Сервис дает поиск по открытым музыкальным каталогам и воспроизводит только те
треки, для которых провайдер отдает полный аудиофайл. Короткие фрагменты в
выдачу не попадают.

Проект учебный, поэтому архитектура простая: один backend, один frontend,
общие пакеты и отдельный слой провайдеров.

## Компоненты

```text
Browser
  |
  v
Web app (HTML/CSS/JS)
  |
  v
API app (Node.js http)
  |
  |-- Search endpoint
  |-- Provider adapters
  |     |-- Internet Archive audio
  |     |-- Audius
  |
  v
Open music APIs
```

## Backend

`apps/api` отвечает за HTTP API и раздачу frontend-статики.

Главный endpoint прототипа:

- `GET /api/v1/search?q=...&limit=...`

Он вызывает провайдеры, приводит результаты к единому формату, убирает явные
дубли и возвращает только треки с `streamUrl`.

## Providers

Каждый провайдер возвращает общий объект:

```ts
type ProviderTrack = {
  id: string;
  provider: string;
  providers: string[];
  externalId: string;
  title: string;
  artistName: string;
  albumTitle?: string;
  durationSeconds?: number;
  coverUrl?: string | null;
  streamUrl: string;
  sourceUrl?: string | null;
};
```

## Frontend

`apps/web/src` содержит обычный HTML/CSS/JS интерфейс:

- форма поиска;
- список найденных треков;
- бейдж источника;
- бейдж `полный трек`;
- audio-плеер;
- ссылка на страницу источника.

## Поток поиска

1. Пользователь вводит запрос.
2. Frontend вызывает `/api/v1/search`.
3. Backend спрашивает открытые провайдеры.
4. Результаты без полного `streamUrl` отбрасываются.
5. Frontend показывает только полные треки.
6. При клике "Слушать" плеер получает прямую ссылку на полный аудиофайл.

## Почему без микросервисов

Для лабораторной работы отдельные сервисы для поиска, пользователей и плеера
усложнили бы запуск. Сейчас весь прототип запускается одной командой и его
легко защитить/показать.
