#!/usr/bin/env python3
import json
import os
import sqlite3
import threading
from datetime import datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
DB_PATH = os.path.join(BASE_DIR, "site.db")


def init_db():
    con = sqlite3.connect(DB_PATH)
    try:
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              text TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
            """
        )
        con.commit()
    finally:
        con.close()


DB_LOCK = threading.Lock()


class AppHandler(SimpleHTTPRequestHandler):
    # Обслуживаем статику из public
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    # Упрощённые CORS для API (на будущее)
    def _set_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            self.send_response(HTTPStatus.NO_CONTENT)
            self._set_cors()
            self.end_headers()
        else:
            super().do_OPTIONS()

    def do_GET(self):
        if self.path.startswith("/api/"):
            self.handle_api_get()
            return
        # Статика
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            self.handle_api_post()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not Found")

    # ---- API ----
    def handle_api_get(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_response(HTTPStatus.OK)
            self._set_cors()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode("utf-8"))
            return

        if parsed.path == "/api/messages":
            with DB_LOCK, sqlite3.connect(DB_PATH) as con:
                con.row_factory = sqlite3.Row
                cur = con.execute(
                    "SELECT id, name, text, created_at FROM messages ORDER BY id DESC LIMIT 200"
                )
                rows = [dict(r) for r in cur.fetchall()]
            self.send_response(HTTPStatus.OK)
            self._set_cors()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(rows).encode("utf-8"))
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Unknown API endpoint")

    def handle_api_post(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", "0") or 0)
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            data = json.loads(body.decode("utf-8"))
        except Exception:
            data = {}

        if parsed.path == "/api/messages":
            name = (data.get("name") or "Гость").strip()[:100]
            text = (data.get("text") or "").strip()[:2000]
            if not text:
                self.send_response(HTTPStatus.BAD_REQUEST)
                self._set_cors()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "text is required"}).encode("utf-8"))
                return
            created_at = datetime.utcnow().isoformat() + "Z"
            with DB_LOCK, sqlite3.connect(DB_PATH) as con:
                con.execute(
                    "INSERT INTO messages(name, text, created_at) VALUES(?,?,?)",
                    (name, text, created_at),
                )
                con.commit()
            self.send_response(HTTPStatus.CREATED)
            self._set_cors()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode("utf-8"))
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Unknown API endpoint")


def run():
    init_db()
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f"Server running on http://{host}:{port}")
    print(f"Static: {PUBLIC_DIR}")
    print(f"DB: {DB_PATH}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        server.server_close()


if __name__ == "__main__":
    run()

