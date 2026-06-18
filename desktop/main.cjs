const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const PORT = process.env.PORT || "3130";
let apiServer = null;
let mainWindow = null;

async function startApi() {
  const rootDir = app.getAppPath();
  const serverPath = path.join(rootDir, "apps", "api", "src", "server.js");
  const serverModule = await import(pathToFileURL(serverPath).href);

  apiServer = serverModule.startServer({ port: PORT });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: "Wavebox",
    backgroundColor: "#0b0d10",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
}

app.whenReady().then(async () => {
  await startApi();
  createWindow();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (apiServer) {
    apiServer.close();
  }
});
