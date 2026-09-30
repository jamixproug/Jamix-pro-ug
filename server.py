#!/usr/bin/env python3
"""JAMIX PRO UG local web server with automatic MP3 discovery."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import quote
import json
import re
import os

ROOT = Path(__file__).resolve().parent
MUSIC_DIR = ROOT / "music"

# Metadata for the tracks already in the JAMIX site. New files are discovered
# automatically and get a clean title based on their filename.
KNOWN = {
    "ava-peace-ndi-omu.mp3": ("Ava Peace — Ndi Omu", "Ava Peace"),
    "long-day-drive-jk-ent-ug.mp3": ("Long Day Drive", "JK Entertainment UG"),
    "5g-eddy-kenzo.mp3": ("5G — Eddy Kenzo", "Eddy Kenzo"),
    "kapeke-ak.mp3": ("KAPEKE — A.K", "A.K"),
    "king-saha-wampaki.mp3": ("Wampaki — King Saha", "King Saha"),
    "stress-killer-sheebah.mp3": ("Stress Killer — Sheebah", "Sheebah"),
    "wewe-fik-fameica-dokta-brain-gloria-bugie.mp3": (
        "Wewe — Fik Fameica x Dokta Brain x Gloria Bugie",
        "Fik Fameica x Dokta Brain x Gloria Bugie",
    ),
}


def clean_name(filename: str) -> str:
    stem = re.sub(r"\.mp3$", "", filename, flags=re.I)
    stem = re.sub(r"[_-]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    return stem.title() or "Untitled Track"


def scan_music():
    MUSIC_DIR.mkdir(exist_ok=True)
    tracks = []
    for path in sorted(MUSIC_DIR.iterdir(), key=lambda p: p.name.lower()):
        if not path.is_file() or path.suffix.lower() != ".mp3":
            continue
        title, artist = KNOWN.get(path.name, (clean_name(path.name), "JAMIX PRO UG"))
        tracks.append({
            "filename": path.name,
            "title": title,
            "artist": artist,
            "url": "/music/" + quote(path.name),
        })
    return tracks


class JamixHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/music":
            body = json.dumps(scan_music(), ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        print("[JAMIX] " + (fmt % args))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    print(f"JAMIX PRO UG server running at http://127.0.0.1:{port}")
    print(f"Watching folder: {MUSIC_DIR}")
    print("Add .mp3 files to music/ and refresh the website — no HTML editing required.")
    ThreadingHTTPServer(("0.0.0.0", port), JamixHandler).serve_forever()
