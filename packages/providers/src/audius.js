import { createTrackId } from "../../shared/src/track.js";

const AUDIUS_HOSTS = [
  "https://discoveryprovider.audius.co",
  "https://api.audius.co"
];

async function fetchFromFirstAvailableHost(pathname, params) {
  let lastError = null;

  for (const host of AUDIUS_HOSTS) {
    const url = new URL(pathname, host);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
      lastError = new Error(`Audius API error: ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Audius API is unavailable");
}

export async function searchAudiusTracks(query, limit = 20) {
  const payload = await fetchFromFirstAvailableHost("/v1/tracks/search", {
    query,
    limit,
    app_name: "open_music_service_student"
  });

  return (payload.data || [])
    .filter((item) => item.id)
    .map((item) => ({
      id: createTrackId("audius", item.id),
      provider: "audius",
      providers: ["audius"],
      externalId: String(item.id),
      title: item.title,
      artistName: item.user?.name || "Unknown artist",
      albumTitle: item.album?.album_name || item.playlist_name,
      durationSeconds: item.duration,
      coverUrl: item.artwork?.["480x480"] || item.artwork?.["150x150"] || null,
      streamUrl: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=open_music_service_student`,
      sourceUrl: item.permalink || null
    }));
}
