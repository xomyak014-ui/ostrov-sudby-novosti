# Остров Судьбы — новости

Новостной сайт сервера **Остров Судьбы** (SCUM).

## Онлайн

Сайт публикуется через **GitHub Pages** — работает постоянно, ПК не нужен.

## Локально

```bat
start.bat
```

Откроется: http://localhost:8090

## Восстановление с GitHub

Если папка пропала с компьютера:

1. Установите [Git](https://git-scm.com/download/win) и [Node.js](https://nodejs.org)
2. В PowerShell:

```powershell
cd $env:USERPROFILE\Desktop
git clone https://github.com/OWNER/REPO.git Ostrov-Sudby-Novosti
cd Ostrov-Sudby-Novosti
npm start
```

(ссылка на репозиторий появится после первого push)

## Файлы

| Файл | Назначение |
|------|------------|
| `index.html` | Страница новости |
| `styles.css` | Стили и анимации |
| `server.js` | Локальный хост (опционально) |
| `start.bat` | Запуск локально |
