# Database draft

## Основные таблицы

```text
users
  id
  email
  password_hash
  display_name
  created_at
  updated_at

artists
  id
  name
  image_url
  created_at

albums
  id
  title
  artist_id
  cover_url
  release_date
  created_at

tracks
  id
  title
  artist_id
  album_id
  duration_seconds
  cover_url
  created_at

track_sources
  id
  track_id
  provider
  external_id
  stream_url
  source_url
  raw_payload_json
  created_at
  updated_at

playlists
  id
  owner_id
  title
  description
  is_public
  created_at
  updated_at

playlist_tracks
  playlist_id
  track_id
  position
  added_at

favorite_tracks
  user_id
  track_id
  created_at
```

## Нормализация треков

Внешние API могут возвращать один и тот же трек по-разному. Поэтому:

- `tracks` хранит локальное представление трека;
- `track_sources` хранит ссылки на внешние источники;
- один локальный трек может иметь несколько источников.

На первом этапе можно не делать сложный fuzzy matching. Достаточно сравнивать:

- название трека;
- имя исполнителя;
- длительность, если она есть;
- название альбома, если оно есть.
