from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .generation import apply_style_transfer, compose

app = FastAPI(title="HarmonyAI Composer", version="1.0.0")


class ComposeRequest(BaseModel):
    lyrics: str = Field(..., min_length=1)
    emotion: str = Field(..., min_length=1)
    genre: str = Field(..., min_length=1)
    tempo: int = Field(ge=30, le=240)


class ComposeResponse(BaseModel):
    audio: str
    midi: str
    pdf: str


class StyleTransferRequest(BaseModel):
    midi_path: str
    target_genre: str
    tempo_shift: Optional[int] = 0


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/compose", response_model=ComposeResponse)
def compose_music(payload: ComposeRequest) -> ComposeResponse:
    try:
        wav, midi, pdf = compose(payload.lyrics, payload.emotion, payload.genre, payload.tempo)
    except Exception as exc:  # pragma: no cover - surface informative error
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ComposeResponse(audio=str(wav), midi=str(midi), pdf=str(pdf))


@app.post("/style-transfer")
def style_transfer(payload: StyleTransferRequest) -> dict[str, str]:
    midi_path = Path(payload.midi_path)
    if not midi_path.exists():
        raise HTTPException(status_code=404, detail="MIDI file not found")

    new_path = apply_style_transfer(midi_path, payload.target_genre, payload.tempo_shift or 0)
    return {"midi": str(new_path)}


if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    import uvicorn

    uvicorn.run("app.main:app", host=host, port=port, reload=False)
