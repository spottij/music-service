import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { searchAllProviders } from "../../../packages/providers/src/index.js";

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = fileURLToPath(new URL("../../..", import.meta.url));
const WEB_DIR = join(ROOT_DIR, "apps", "web", "src");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(text);
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/v1/health") {
    sendJson(response, 200, {
      status: "ok",
      service: "open-music-service"
    });
    return;
  }

  if (url.pathname === "/api/v1/search") {
    const query = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 40);

    if (query.length < 2) {
      sendJson(response, 400, {
        error: "QUERY_TOO_SHORT",
        message: "Введите минимум 2 символа для поиска."
      });
      return;
    }

    try {
      const items = await searchAllProviders(query, limit);
      sendJson(response, 200, {
        query,
        count: items.length,
        items
      });
    } catch (error) {
      sendJson(response, 502, {
        error: "PROVIDER_ERROR",
        message: "Не удалось получить ответ от музыкальных провайдеров.",
        details: error.message
      });
    }
    return;
  }

  sendJson(response, 404, {
    error: "NOT_FOUND",
    message: "Такого API endpoint пока нет."
  });
}

async function serveStatic(response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(WEB_DIR, safePath);

  if (!filePath.startsWith(WEB_DIR)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    const contentType = contentTypes[extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(file);
  } catch {
    const file = await readFile(join(WEB_DIR, "index.html"));
    response.writeHead(200, { "Content-Type": contentTypes[".html"] });
    response.end(file);
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    await handleApi(request, response, url);
    return;
  }

  await serveStatic(response, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Open Music Service started: http://localhost:${PORT}`);
});

