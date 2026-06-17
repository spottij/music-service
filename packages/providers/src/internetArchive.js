import { createTrackId } from "../../shared/src/track.js";

const SEARCH_URL = "https://archive.org/advancedsearch.php";
const METADATA_URL = "https://archive.org/metadata/";
const AUDIO_FORMATS = new Set([
  "VBR MP3",
  "MP3",
  "Ogg Vorbis",
  "Flac",
  "WAVE",
  "24bit Flac"
]);

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function encodeArchivePathPart(value) {
  return String(value)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function findAudioFile(files = []) {
  return files.find((file) => {
    const name = String(file.name || "").toLowerCase();
    return (
      AUDIO_FORMATS.has(file.format) ||
      name.endsWith(".mp3") ||
      name.endsWith(".ogg") ||
      name.endsWith(".flac") ||
      name.endsWith(".wav")
    );
  });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "OpenMusicService/0.1 student-project"
    }
  });

  if (!response.ok) {
    throw new Error(`Internet Archive API error: ${response.status}`);
  }

  return response.json();
}

async function getArchiveTrack(document) {
  const identifier = document.identifier;
  const metadata = await fetchJson(`${METADATA_URL}${encodeURIComponent(identifier)}`);
  const audioFile = findAudioFile(metadata.files);

  if (!audioFile) {
    return null;
  }

  const title = firstValue(metadata.metadata?.title) || document.title || identifier;
  const creator = firstValue(metadata.metadata?.creator) || firstValue(document.creator) || "Internet Archive";
  const coverFile = metadata.files?.find((file) => {
    const name = String(file.name || "").toLowerCase();
    return name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png");
  });

  const encodedIdentifier = encodeURIComponent(identifier);
  const streamUrl = `https://archive.org/download/${encodedIdentifier}/${encodeArchivePathPart(audioFile.name)}`;
  const coverUrl = coverFile
    ? `https://archive.org/download/${encodedIdentifier}/${encodeArchivePathPart(coverFile.name)}`
    : null;

  return {
    id: createTrackId("internet-archive", `${identifier}/${audioFile.name}`),
    provider: "internet-archive",
    providers: ["internet-archive"],
    externalId: identifier,
    title,
    artistName: creator,
    albumTitle: firstValue(metadata.metadata?.collection),
    durationSeconds: audioFile.length ? Math.round(Number(audioFile.length)) : undefined,
    coverUrl,
    streamUrl,
    sourceUrl: `https://archive.org/details/${encodedIdentifier}`
  };
}

export async function searchInternetArchiveTracks(query, limit = 20) {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", `mediatype:audio AND (title:${query} OR creator:${query})`);
  url.searchParams.set("fl", "identifier,title,creator");
  url.searchParams.set("rows", String(Math.min(limit * 2, 50)));
  url.searchParams.set("output", "json");

  const payload = await fetchJson(url);
  const documents = payload.response?.docs || [];
  const settledTracks = await Promise.allSettled(
    documents.map((document) => getArchiveTrack(document))
  );

  return settledTracks
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .filter(Boolean)
    .slice(0, limit);
}
