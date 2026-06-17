const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const results = document.querySelector("#results");
const statusLabel = document.querySelector("#status");
const audio = document.querySelector("#audio");
const playerCover = document.querySelector("#player-cover");
const playerTitle = document.querySelector("#player-title");
const playerArtist = document.querySelector("#player-artist");
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
  playerCover.src = track.coverUrl || "/logo.svg";
  playerTitle.textContent = track.title;
  playerArtist.textContent = `${track.artistName}${track.albumTitle ? ` · ${track.albumTitle}` : ""}`;
  sourceLink.href = track.sourceUrl || "#";

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
          <span class="badge">полный трек</span>
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
  setStatus("Ищу полные треки...");
  results.innerHTML = '<p class="empty">Запрашиваю открытые каталоги. 30-секундные фрагменты не показываются.</p>';

  const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}&limit=6`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Ошибка поиска");
  }

  renderTracks(payload.items);
  setStatus(`Полных треков: ${payload.count}`);
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
