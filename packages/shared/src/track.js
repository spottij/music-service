export function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function createTrackId(provider, externalId) {
  return `${provider}:${externalId}`;
}

export function createDedupeKey(track) {
  return [
    normalizeText(track.title),
    normalizeText(track.artistName),
    Math.round(Number(track.durationSeconds || 0) / 5)
  ].join("|");
}

