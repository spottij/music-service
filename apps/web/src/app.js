const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const results = document.querySelector("#results");
const statusLabel = document.querySelector("#status");
const audio = document.querySelector("#audio");
const playerCover = document.querySelector("#player-cover");
const miniCover = document.querySelector("#mini-cover");
const videoPlayer = document.querySelector("#video-player");
const detailsPanel = document.querySelector(".details-panel");
const playerTitle = document.querySelector("#player-title");
const playerArtist = document.querySelector("#player-artist");
const miniTitle = document.querySelector("#mini-title");
const miniArtist = document.querySelector("#mini-artist");
const sourceLink = document.querySelector("#source-link");

function formatDuration(seconds) {
  if (!seconds) {
    return "";
  }

  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function setStatus(text) {
  statusLabel.textContent = text;
}

function setPlayer(track) {
  const cover = track.coverUrl || "/logo.svg";
  const subtitle = `${track.artistName}${track.albumTitle ? ` · ${track.albumTitle}` : ""}`;

  playerCover.src = cover;
  miniCover.src = cover;
  playerTitle.textContent = track.title;
  miniTitle.textContent = track.title;
  playerArtist.textContent = subtitle;
  miniArtist.textContent = subtitle;
  sourceLink.href = track.sourceUrl || "#";

  if (track.embedUrl) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    videoPlayer.src = track.embedUrl;
    detailsPanel.classList.add("video-mode");
    return;
  }

  videoPlayer.removeAttribute("src");
  detailsPanel.classList.remove("video-mode");
  audio.src = track.streamUrl;
  audio.play().catch(() => {});
}

function renderTracks(tracks) {
  results.innerHTML = "";

  if (!tracks.length) {
    results.innerHTML = '<p class="empty">В открытых каталогах ничего не найдено. Попробуйте другой запрос.</p>';
    return;
  }

  for (const track of tracks) {
    const element = document.createElement("article");
    element.className = "track";

    const duration = formatDuration(track.durationSeconds);
    const providers = track.providers || [track.provider];
    const playbackLabel = track.embedUrl ? "YouTube" : "полный трек";
    const title = escapeHtml(track.title || "Без названия");
    const artistName = escapeHtml(track.artistName || "Неизвестный исполнитель");
    const coverUrl = escapeAttribute(track.coverUrl || "/logo.svg");
    const sourceUrl = escapeAttribute(track.sourceUrl || "");

    element.innerHTML = `
      <img src="${coverUrl}" alt="" loading="lazy" />
      <div>
        <h3>${title}</h3>
        <p>${artistName}${duration ? ` · ${duration}` : ""}</p>
        <div class="badges">
          ${providers.map((provider) => `<span class="badge">${escapeHtml(provider)}</span>`).join("")}
          <span class="badge">${playbackLabel}</span>
        </div>
      </div>
      <div class="track-actions">
        <button type="button">Слушать</button>
        ${track.sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noreferrer">Источник</a>` : ""}
      </div>
    `;

    element.querySelector("button").addEventListener("click", () => setPlayer(track));
    results.append(element);
  }
}

async function searchTracks(query) {
  setStatus("Ищу треки...");
  results.innerHTML = '<p class="empty">Запрашиваю YouTube и открытые аудиокаталоги.</p>';

  const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}&limit=6`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Ошибка поиска");
  }

  renderTracks(payload.items);
  setStatus(`Найдено: ${payload.count}`);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = queryInput.value.trim();
  if (query.length < 2) {
    setStatus("Минимум 2 символа");
    return;
  }

  try {
    await searchTracks(query);
  } catch (error) {
    setStatus("Ошибка");
    results.innerHTML = `<p class="empty">${escapeHtml(error.message)}</p>`;
  }
});

searchTracks(queryInput.value).catch((error) => {
  setStatus("Ошибка");
  results.innerHTML = `<p class="empty">${escapeHtml(error.message)}</p>`;
});
