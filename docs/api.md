# HTTP API draft

Базовый префикс: `/api/v1`.

## Health

```http
GET /health
```

Ответ:

```json
{
  "status": "ok",
  "service": "open-music-service"
}
```

## Search

```http
GET /search?q={query}&limit=6
```

Ответ:

```json
{
  "query": "lofi",
  "count": 1,
  "items": [
    {
      "id": "internet-archive:item/file.mp3",
      "provider": "internet-archive",
      "providers": ["internet-archive"],
      "externalId": "item",
      "title": "Track title",
      "artistName": "Artist",
      "albumTitle": "Collection",
      "durationSeconds": 180,
      "coverUrl": "https://example.com/cover.jpg",
      "streamUrl": "https://example.com/full-track.mp3",
      "sourceUrl": "https://example.com/source"
    }
  ]
}
```

## Правило воспроизведения

API возвращает только треки с полным `streamUrl`. Если провайдер дает только
короткий фрагмент, такой результат не попадает в выдачу.

## Будущие endpoints

```http
POST   /auth/register
POST   /auth/login
GET    /me/favorites/tracks
POST   /me/favorites/tracks/{trackId}
DELETE /me/favorites/tracks/{trackId}
GET    /playlists
POST   /playlists
GET    /playlists/{id}
PATCH  /playlists/{id}
DELETE /playlists/{id}
```
