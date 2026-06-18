# Packaging

## Windows EXE

Windows-сборка готовится через Electron.

Локально:

```bash
npm install
npm run package:win
```

На GitHub:

1. Открой вкладку `Actions`.
2. Запусти workflow `Build Windows EXE`.
3. Скачай artifact `wavebox-windows`.

Приложение запускает backend внутри Electron и открывает Wavebox в отдельном
окне. Пользователю не нужно вручную открывать `localhost`.

## Android APK

Android-сборка добавляется отдельным workflow через Capacitor.
