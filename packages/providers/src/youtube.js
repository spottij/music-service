import { createTrackId } from "../../shared/src/track.js";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const INVIDIOUS_HOSTS = [
  "https://yewtu.be",
  "https://invidious.nerdvpn.de",
  "https://vid.puffyan.us"
];

function parseIsoDuration(value) {
  const match = String(value || "").match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return undefined;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function createYoutubeTrack(video) {
  const videoId = video.videoId || video.id;
  const title = video.title;
  const artistName = video.author || video.channelTitle || video.channelName || "YouTube";
  const coverUrl = video.videoThumbnails?.find((item) => item.quality === "medium")?.url
    || video.videoThumbnails?.[0]?.url
    || video.thumbnails?.high?.url
    || video.thumbnails?.medium?.url
    || video.thumbnails?.default?.url
    || null;

  return {
    id: createTrackId("youtube", videoId),
    provider: "youtube",
    providers: ["youtube"],
    externalId: String(videoId),
    title,
    artistName,
    albumTitle: "YouTube",
    durationSeconds: video.lengthSeconds ? Number(video.lengthSeconds) : parseIsoDuration(video.duration),
    coverUrl,
    streamUrl: null,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`
  };
}

async function fetchJson(url, timeoutMs = 2500) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Wavebox/0.2 student-project"
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    throw new Error(`YouTube provider error: ${response.status}`);
  }

  return response.json();
}

async function searchOfficialYoutube(query, limit) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return [];
  }

  const searchUrl = new URL(YOUTUBE_SEARCH_URL);
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoCategoryId", "10");
  searchUrl.searchParams.set("maxResults", String(Math.min(limit, 25)));
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("key", apiKey);

  const searchPayload = await fetchJson(searchUrl);
  const ids = (searchPayload.items || [])
    .map((item) => item.id?.videoId)
    .filter(Boolean);

  if (!ids.length) {
    return [];
  }

  const videosUrl = new URL(YOUTUBE_VIDEOS_URL);
  videosUrl.searchParams.set("part", "snippet,contentDetails");
  videosUrl.searchParams.set("id", ids.join(","));
  videosUrl.searchParams.set("key", apiKey);

  const videosPayload = await fetchJson(videosUrl);
  return (videosPayload.items || []).map((item) => createYoutubeTrack({
    videoId: item.id,
    title: item.snippet?.title,
    channelTitle: item.snippet?.channelTitle,
    thumbnails: item.snippet?.thumbnails,
    duration: item.contentDetails?.duration
  }));
}

async function searchInvidious(query, limit) {
  let lastError = null;

  for (const host of INVIDIOUS_HOSTS) {
    const url = new URL("/api/v1/search", host);
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("sort_by", "relevance");

    try {
      const payload = await fetchJson(url);
      return payload
        .filter((item) => item.type === "video" && item.videoId)
        .slice(0, limit)
        .map(createYoutubeTrack);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("YouTube provider is unavailable");
}

export async function searchYoutubeTracks(query, limit = 20) {
  const officialResults = await searchOfficialYoutube(query, limit);
  if (officialResults.length) {
    return officialResults;
  }

  return searchInvidious(query, limit);
}
