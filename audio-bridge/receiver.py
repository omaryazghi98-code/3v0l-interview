"""3V0L LAN PCM receiver -> Deepgram realtime STT -> browser SSE.

Runs on PC3/Acer. The Windows process-loopback listener on the interview PC
connects to TCP_PORT and streams raw mono PCM16 at 48 kHz. This receiver
forwards that audio to Deepgram Nova-3 and exposes transcript events locally
via SSE for EV0L.

Environment:
  DEEPGRAM_API_KEY  required
  DEEPGRAM_MODEL    default: nova-3
  DEEPGRAM_LANGUAGE default: multi
  AUDIO_PORT        default: 38472
  SSE_PORT          default: 38473
"""

from __future__ import annotations

import json
import os
import socket
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlencode

import websocket


HOST = "0.0.0.0"
AUDIO_PORT = int(os.getenv("AUDIO_PORT", "38472"))
SSE_PORT = int(os.getenv("SSE_PORT", "38473"))
DEEPGRAM_MODEL = os.getenv("DEEPGRAM_MODEL", "nova-3")
DEEPGRAM_LANGUAGE = os.getenv("DEEPGRAM_LANGUAGE", "multi")
SAMPLE_RATE = 48000
CHANNELS = 1


sse_clients: set[object] = set()
sse_lock = threading.Lock()


def load_dotenv() -> None:
    path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            if key and key not in os.environ:
                os.environ[key] = value.strip().strip("'\"")


def emit(event: dict) -> None:
    payload = f"data: {json.dumps(event, ensure_ascii=False)}\n\n".encode("utf-8")
    dead = []
    with sse_lock:
        for client in list(sse_clients):
            try:
                client.wfile.write(payload)
                client.wfile.flush()
            except Exception:
                dead.append(client)
        for client in dead:
            sse_clients.discard(client)


class SSEHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] != "/events":
            self.send_response(404)
            self.end_headers()
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Connection", "keep-alive")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        try:
            self.wfile.write(b": connected\n\n")
            self.wfile.flush()
            with sse_lock:
                sse_clients.add(self)
            while True:
                time.sleep(30)
                self.wfile.write(b": ping\n\n")
                self.wfile.flush()
        except Exception:
            pass
        finally:
            with sse_lock:
                sse_clients.discard(self)

    def log_message(self, format: str, *args) -> None:
        return


def deepgram_url() -> str:
    params = {
        "model": DEEPGRAM_MODEL,
        "language": DEEPGRAM_LANGUAGE,
        "encoding": "linear16",
        "sample_rate": str(SAMPLE_RATE),
        "channels": str(CHANNELS),
        "interim_results": "true",
        "smart_format": "true",
        "punctuate": "true",
        "endpointing": "300",
        "vad_events": "true",
    }
    return "wss://api.deepgram.com/v1/listen?" + urlencode(params)


def transcriber(conn: socket.socket, addr: tuple[str, int]) -> None:
    api_key = os.getenv("DEEPGRAM_API_KEY", "").strip()
    if not api_key:
        print("ERROR: DEEPGRAM_API_KEY is not set; cannot transcribe.")
        conn.close()
        return

    ws = None
    stop = threading.Event()

    def read_deepgram() -> None:
        try:
            while not stop.is_set():
                message = ws.recv()
                if not message:
                    break
                if isinstance(message, bytes):
                    continue
                try:
                    obj = json.loads(message)
                except json.JSONDecodeError:
                    continue
                if obj.get("type") != "Results":
                    continue
                channel = obj.get("channel") or {}
                alternatives = channel.get("alternatives") or []
                if not alternatives:
                    continue
                transcript = str(alternatives[0].get("transcript") or "").strip()
                if not transcript:
                    continue
                event = {
                    "type": "speaker_transcript",
                    "text": transcript,
                    "speaker": "Them",
                    "is_final": bool(obj.get("is_final", False)),
                    "speech_final": bool(obj.get("speech_final", False)),
                    "timestamp_ms": int(time.time() * 1000),
                }
                emit(event)
                print(
                    f"[{('FINAL' if event['is_final'] else 'INTERIM')}] {transcript}",
                    flush=True,
                )
        except Exception as exc:
            if not stop.is_set():
                print(f"Deepgram receive error: {exc}", flush=True)
        finally:
            stop.set()

    print(f"Audio client connected: {addr}", flush=True)
    try:
        ws = websocket.create_connection(
            deepgram_url(),
            header=[f"Authorization: Token {api_key}"],
            timeout=10,
        )
        ws.settimeout(2)
        print("Deepgram connected.", flush=True)
        emit({"type": "status", "connected": True, "source": "deepgram"})

        reader = threading.Thread(target=read_deepgram, daemon=True)
        reader.start()

        while not stop.is_set():
            data = conn.recv(65536)
            if not data:
                break
            try:
                ws.send(data, opcode=websocket.ABNF.OPCODE_BINARY)
            except Exception as exc:
                print(f"Deepgram send error: {exc}", flush=True)
                break
    except Exception as exc:
        print(f"Deepgram connection error: {exc}", flush=True)
        emit({"type": "status", "connected": False, "error": str(exc)})
    finally:
        stop.set()
        try:
            if ws:
                ws.send(json.dumps({"type": "CloseStream"}))
                ws.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass
        emit({"type": "status", "connected": False, "source": "deepgram"})
        print(f"Audio client disconnected: {addr}", flush=True)


def audio_server() -> None:
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, AUDIO_PORT))
    server.listen(4)
    print(f"LAN audio receiver listening on 0.0.0.0:{AUDIO_PORT}", flush=True)
    while True:
        conn, addr = server.accept()
        threading.Thread(target=transcriber, args=(conn, addr), daemon=True).start()


def main() -> None:
    load_dotenv()
    if not os.getenv("DEEPGRAM_API_KEY", "").strip():
        print("WARNING: DEEPGRAM_API_KEY is not set.", flush=True)

    httpd = ThreadingHTTPServer(("127.0.0.1", SSE_PORT), SSEHandler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    print(f"EV0L transcript SSE: http://127.0.0.1:{SSE_PORT}/events", flush=True)
    audio_server()


if __name__ == "__main__":
    main()
