from __future__ import annotations

import math
import random
import wave
from array import array
from pathlib import Path
from typing import Iterable, List, Tuple

from midiutil import MIDIFile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "output"
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

SAMPLE_RATE = 44100
BIT_DEPTH = 16


def _scale_for_genre(genre: str) -> List[int]:
    base_scales = {
        "carnatic": [60, 62, 63, 65, 67, 69, 70, 72],
        "hindustani": [60, 62, 64, 65, 67, 69, 71, 72],
        "sufi": [57, 60, 62, 63, 67, 69, 72, 74],
        "bollywood fusion": [55, 60, 62, 64, 67, 69, 71, 74],
    }
    return base_scales.get(genre.lower(), base_scales["hindustani"])


def _emotion_variation(emotion: str) -> int:
    variations = {
        "love": 2,
        "joy": 3,
        "sadness": -2,
        "longing": -1,
        "devotion": 1,
        "energy": 4,
    }
    return variations.get(emotion.lower(), 0)


def generate_melody(
    lyrics: str,
    emotion: str,
    genre: str,
    tempo: int,
    measures: int = 8,
) -> List[Tuple[int, float]]:
    scale = _scale_for_genre(genre)
    variation = _emotion_variation(emotion)
    seed = sum(ord(c) for c in lyrics) + variation
    random.seed(seed)
    melody: List[Tuple[int, float]] = []
    beats_per_measure = 4
    total_beats = measures * beats_per_measure
    remaining_beats = total_beats

    while remaining_beats > 0:
        pitch = random.choice(scale)
        duration = random.choice([0.25, 0.5, 1, 2])
        if duration > remaining_beats:
            duration = remaining_beats
        melody.append((pitch + variation, duration))
        remaining_beats -= duration

    return melody


def _melody_filename(prefix: str, extension: str) -> Path:
    OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
    return OUTPUT_DIR / f"{prefix}.{extension}"


def save_midi(melody: Iterable[Tuple[int, float]], tempo: int, filename: str) -> Path:
    midi = MIDIFile(1)
    track = 0
    time = 0
    midi.addTempo(track, time, tempo)

    for pitch, duration in melody:
        midi.addNote(track, channel=0, pitch=pitch, time=time, duration=duration, volume=90)
        time += duration

    path = _melody_filename(filename, "mid")
    with path.open("wb") as f:
        midi.writeFile(f)
    return path


def save_wav(melody: Iterable[Tuple[int, float]], tempo: int, filename: str) -> Path:
    wav_path = _melody_filename(filename, "wav")
    amplitude = (2 ** (BIT_DEPTH - 1)) - 1
    data = array("h")

    seconds_per_beat = 60.0 / max(tempo, 1)

    for pitch, duration in melody:
        frequency = 440.0 * (2 ** ((pitch - 69) / 12))
        total_samples = int(SAMPLE_RATE * seconds_per_beat * duration)
        for n in range(total_samples):
            value = amplitude * math.sin(2 * math.pi * frequency * (n / SAMPLE_RATE))
            data.append(int(value))

    with wave.open(str(wav_path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(BIT_DEPTH // 8)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(data.tobytes())

    return wav_path


def save_pdf(melody: Iterable[Tuple[int, float]], filename: str) -> Path:
    pdf_path = _melody_filename(filename, "pdf")
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 18)
    c.drawString(72, height - 72, "AI Generated Melody")

    c.setFont("Helvetica", 12)
    c.drawString(72, height - 108, "Pitch / Duration (beats)")

    y = height - 144
    for index, (pitch, duration) in enumerate(melody, start=1):
        c.drawString(72, y, f"{index:02d}. Pitch: {pitch} Duration: {duration}")
        y -= 18
        if y < 72:
            c.showPage()
            y = height - 72

    c.save()
    return pdf_path


def render_outputs(
    melody: Iterable[Tuple[int, float]],
    tempo: int,
    stem: str,
) -> Tuple[Path, Path, Path]:
    midi = save_midi(melody, tempo, stem)
    wav = save_wav(melody, tempo, stem)
    pdf = save_pdf(melody, stem)
    return wav, midi, pdf


def compose(lyrics: str, emotion: str, genre: str, tempo: int) -> Tuple[Path, Path, Path]:
    melody = generate_melody(lyrics, emotion, genre, tempo)
    stem = f"composition_{abs(hash((lyrics, emotion, genre, tempo))) % 1_000_000}"
    return render_outputs(melody, tempo, stem)


def apply_style_transfer(
    midi_path: Path,
    target_genre: str,
    tempo_shift: int = 0,
) -> Path:
    new_stem = midi_path.stem + f"_{target_genre.lower()}"
    target_path = _melody_filename(new_stem, "mid")
    with midi_path.open("rb") as src, target_path.open("wb") as dst:
        dst.write(src.read())
    return target_path
