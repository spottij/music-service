const { app, BrowserWindow } = require("electron");
const { fork } = require("node:child_process");
const path = require("node:path");

const PORT = process.env.PORT || "3130";
let apiProcess = null;
let mainWindow = null;

function startApi() {
  const rootDir = app.getAppPath();
  const serverPath = path.join(rootDir, "apps", "api", "src", "server.js");

  apiProcess = fork(serverPath, [], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT
    },
    stdio: "ignore"
  });
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

app.whenReady().then(() => {
  startApi();
  setTimeout(createWindow, 800);
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
  if (apiProcess) {
    apiProcess.kill();
  }
});
