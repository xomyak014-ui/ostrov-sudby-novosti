# Остров Судьбы — сайт

Официальный сайт PvE-проекта **Остров Судьбы** (SCUM).

## Разделы

- **Серверы** — главная страница со списком PvE-серверов (`servers.json`)
- **Новости** — новости игры SCUM

## Онлайн

Публичная ссылка (если Pages доступен):  
https://xomyak014-ui.github.io/ostrov-sudby-novosti/

Репозиторий **приватный** — исходники видите только вы (и кому дадите доступ).

## Локально

```bat
start.bat
```

http://localhost:8090

## Восстановление

```powershell
cd $env:USERPROFILE\Desktop
gh repo clone xomyak014-ui/ostrov-sudby-novosti Ostrov-Sudby-Novosti
cd Ostrov-Sudby-Novosti
npm start
```

(нужен вход в GitHub: `gh auth login`)

## Редактирование серверов

Файл `servers.json` — имя, режим, статус, IP, описание, теги.
