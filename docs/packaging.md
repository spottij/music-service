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

Android-сборка готовится через Capacitor.

Локально:

```bash
npm install
npm run android:add
npm run android:copy
cd android
gradlew assembleDebug
```

На GitHub:

1. Открой вкладку `Actions`.
2. Запусти workflow `Build Android APK`.
3. Скачай artifact `wavebox-android-apk`.

Для рабочего поиска в APK нужен доступный backend URL. Его можно задать в
GitHub Secrets как `WAVEBOX_API_BASE`, например:

```text
https://example.com
```

Если secret пустой, APK соберется, но запросы будут идти относительно
локального WebView и backend API не будет найден.
