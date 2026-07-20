# Остров Судьбы — новости

Новостной сайт сервера **Остров Судьбы** (SCUM).

## Онлайн (постоянная ссылка)

https://xomyak014-ui.github.io/ostrov-sudby-novosti/

Работает через **GitHub Pages** — ПК не нужен, ссылка не меняется.

## Репозиторий (бэкап всех файлов)

https://github.com/xomyak014-ui/ostrov-sudby-novosti

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
git clone https://github.com/xomyak014-ui/ostrov-sudby-novosti.git Ostrov-Sudby-Novosti
cd Ostrov-Sudby-Novosti
npm start
```

## Файлы

| Файл | Назначение |
|------|------------|
| `index.html` | Страница новости |
| `styles.css` | Стили и анимации |
| `server.js` | Локальный хост (опционально) |
| `start.bat` | Запуск локально |
