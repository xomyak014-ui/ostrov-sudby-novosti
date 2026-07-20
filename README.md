# Остров Судьбы — сайт

Официальный сайт PvE-проекта **Остров Судьбы** (SCUM).

## Разделы

- **Серверы** — главная страница со списком PvE-серверов (`servers.json`)
- **Новости** — новости игры SCUM

## Онлайн

https://xomyak014-ui.github.io/ostrov-sudby-novosti/

Репозиторий: https://github.com/xomyak014-ui/ostrov-sudby-novosti

## Локально

```bat
start.bat
```

http://localhost:8090

## Восстановление

```powershell
cd $env:USERPROFILE\Desktop
git clone https://github.com/xomyak014-ui/ostrov-sudby-novosti.git Ostrov-Sudby-Novosti
cd Ostrov-Sudby-Novosti
npm start
```

## Редактирование серверов

Файл `servers.json` — имя, режим, статус, IP, описание, теги.

