# Сайт в интернете

Самостоятельно хостимый сайт с локальной базой данных (SQLite) и минимальным Python‑сервером без внешних зависимостей.

## Что внутри
- `server.py` — HTTP‑сервер (стандартная библиотека), API `/api/*`, статика из `public/`, SQLite‑база `site.db`.
- `public/` — фронтенд (HTML/CSS/JS). Демо: список сообщений и форма добавления.

## Запуск локально
1. Откройте терминал в папке проекта: `cd "Сайт в интернете"`
2. Запустите сервер: `py server.py` (Windows) или `python3 server.py` (Linux/macOS)
3. Перейдите в браузере: `http://localhost:8080`

Переменные окружения:
- `HOST` (по умолчанию `0.0.0.0`)
- `PORT` (по умолчанию `8080`)

Примеры:
```
PORT=9000 python3 server.py
```
или Windows PowerShell:
```
$env:PORT=9000; py server.py
```

## Структура БД
Создаётся файл `site.db` с таблицей `messages(id INTEGER PRIMARY KEY, name TEXT, text TEXT, created_at TEXT)`.

API:
- `GET /api/health` → `{ status: "ok" }`
- `GET /api/messages` → массив сообщений
- `POST /api/messages` → добавление сообщения `{ name, text }`

## Доступ из интернета
1. Постоянный IP или динамический DNS (No-IP, DuckDNS и т.п.).
2. Проброс портов на роутере: WAN:80 → PC:8080 (или ваш порт). Разрешите входящие в файерволе Windows.
3. Зарегистрируйте домен у регистратора. Укажите A‑запись на ваш внешний IP.
4. HTTPS:
   - Проще всего через Caddy (автовыдача Let’s Encrypt): проксируйте `:80/:443` к `http://127.0.0.1:8080`.
   - Альтернатива: Nginx + Certbot или Cloudflare Tunnel (без проброса портов).

Готов помочь настроить прокси/SSL под вашу среду (Caddy/Nginx/Cloudflare).

