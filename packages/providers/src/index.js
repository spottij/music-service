import { searchAudiusTracks } from "./audius.js";
import { searchInternetArchiveTracks } from "./internetArchive.js";
import { searchYoutubeTracks } from "./youtube.js";
import { createDedupeKey } from "../../shared/src/track.js";

const providers = [searchYoutubeTracks, searchInternetArchiveTracks, searchAudiusTracks];

export async function searchAllProviders(query, limit = 20) {
  const settled = await Promise.allSettled(
    providers.map((providerSearch) => providerSearch(query, limit))
  );

  const tracks = settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((track) => track.streamUrl || track.embedUrl);

  const byKey = new Map();

  for (const track of tracks) {
    const key = createDedupeKey(track);
    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, track);
      continue;
    }

      byKey.set(key, {
        ...current,
        streamUrl: current.streamUrl || track.streamUrl,
        sourceUrl: current.sourceUrl || track.sourceUrl,
        providers: Array.from(new Set([...(current.providers || []), track.provider]))
    });
  }

  return Array.from(byKey.values()).slice(0, limit);
}
