from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Optional

import requests

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MUSICGEN_DEFAULT_MODEL = "facebook/musicgen-small"
MUSICGEN_TIMEOUT = int(os.environ.get("MUSICGEN_TIMEOUT", "180"))
MUSICGEN_RETRY_DELAY = 5
MUSICGEN_MAX_RETRIES = 4


def _build_prompt(lyrics: str, emotion: str, genre: str, tempo: int) -> str:
    snippet = " ".join(lyrics.split())
    if len(snippet) > 500:
        snippet = snippet[:497] + "..."

    return (
        f"Create a {genre} inspired instrumental with a {emotion.lower()} mood at {tempo} BPM. "
        f"Incorporate motifs that could accompany these lyrics: '{snippet}'."
    )


def _musicgen_endpoint() -> str:
    model_id = os.environ.get("MUSICGEN_MODEL_ID", MUSICGEN_DEFAULT_MODEL)
    return f"https://api-inference.huggingface.co/models/{model_id}"


def _auth_headers() -> Optional[dict[str, str]]:
    token = os.environ.get("HUGGINGFACE_TOKEN") or os.environ.get("HF_TOKEN")
    if not token:
        return None
    return {"Authorization": f"Bearer {token}"}


def _store_audio(content: bytes, stem: str) -> Path:
    wav_path = OUTPUT_DIR / f"{stem}.wav"
    wav_path.write_bytes(content)
    return wav_path


def _handle_json_error(response_json: object) -> str:
    if isinstance(response_json, dict):
        message = response_json.get("error") or response_json.get("message")
        if message:
            return str(message)
    return json.dumps(response_json)


def try_musicgen(
    lyrics: str,
    emotion: str,
    genre: str,
    tempo: int,
    stem: str,
) -> Optional[Path]:
    headers = _auth_headers()
    if not headers:
        return None

    endpoint = _musicgen_endpoint()
    prompt = _build_prompt(lyrics, emotion, genre, tempo)
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 1024,
            "temperature": 1.0,
            "top_k": 250,
        },
        "options": {"wait_for_model": True},
    }

    for attempt in range(MUSICGEN_MAX_RETRIES):
        try:
            response = requests.post(
                endpoint,
                headers=headers,
                json=payload,
                timeout=MUSICGEN_TIMEOUT,
            )
        except requests.RequestException as exc:
            if attempt == MUSICGEN_MAX_RETRIES - 1:
                raise RuntimeError(f"MusicGen request failed: {exc}")
            time.sleep(MUSICGEN_RETRY_DELAY * (attempt + 1))
            continue

        if response.status_code == 200:
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                detail = _handle_json_error(response.json())
                if "loading" in detail.lower() or "queue" in detail.lower():
                    time.sleep(MUSICGEN_RETRY_DELAY * (attempt + 1))
                    continue
                raise RuntimeError(f"MusicGen returned error payload: {detail}")
            return _store_audio(response.content, stem)

        if response.status_code in {202, 429}:
            time.sleep(MUSICGEN_RETRY_DELAY * (attempt + 1))
            continue

        try:
            detail = response.json()
            error_message = _handle_json_error(detail)
        except ValueError:
            error_message = response.text

        raise RuntimeError(
            f"MusicGen request failed with status {response.status_code}: {error_message}"
        )

    return None
