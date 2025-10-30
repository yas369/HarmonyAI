from __future__ import annotations

import math
import random
import struct
import wave
from array import array
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

try:
    from .musicgen import try_musicgen
except Exception:  # pragma: no cover - optional dependency failures fall back to procedural synth
    try_musicgen = None

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "output"
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

SAMPLE_RATE = 44100
BIT_DEPTH = 16
TICKS_PER_BEAT = 480


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


def _encode_variable_length(value: int) -> bytes:
    """Encode an integer using the MIDI variable-length quantity format."""
    buffer = value & 0x7F
    value >>= 7
    bytes_list = [buffer]
    while value:
        buffer = (value & 0x7F) | 0x80
        bytes_list.insert(0, buffer)
        value >>= 7
    return bytes(bytes_list)


def _clamp_pitch(pitch: int) -> int:
    return max(0, min(127, pitch))


def save_midi(melody: Iterable[Tuple[int, float]], tempo: int, filename: str) -> Path:
    midi_path = _melody_filename(filename, "mid")
    tempo = max(tempo, 1)
    microseconds_per_quarter = int(60_000_000 / tempo)

    track_data = bytearray()
    track_data.extend(b"\x00\xFF\x51\x03" + microseconds_per_quarter.to_bytes(3, "big"))
    track_data.extend(b"\x00\xC0\x30")  # choose a mellow synth pad instrument

    for pitch, duration in melody:
        ticks = max(1, int(duration * TICKS_PER_BEAT))
        clamped_pitch = _clamp_pitch(pitch)
        track_data.extend(b"\x00")
        track_data.extend(bytes([0x90, clamped_pitch, 0x5A]))
        track_data.extend(_encode_variable_length(ticks))
        track_data.extend(bytes([0x80, clamped_pitch, 0x40]))

    track_data.extend(b"\x00\xFF\x2F\x00")

    with midi_path.open("wb") as midi_file:
        midi_file.write(b"MThd")
        midi_file.write(struct.pack(">IHHH", 6, 0, 1, TICKS_PER_BEAT))
        midi_file.write(b"MTrk")
        midi_file.write(struct.pack(">I", len(track_data)))
        midi_file.write(track_data)

    return midi_path


def save_wav(melody: Iterable[Tuple[int, float]], tempo: int, filename: str) -> Path:
    wav_path = _melody_filename(filename, "wav")
    amplitude = (2 ** (BIT_DEPTH - 1)) - 1
    data = array("h")

    seconds_per_beat = 60.0 / max(tempo, 1)

    for pitch, duration in melody:
        frequency = 440.0 * (2 ** ((pitch - 69) / 12))
        total_samples = max(1, int(SAMPLE_RATE * seconds_per_beat * duration))
        fade_samples = max(1, min(total_samples // 4, 400))
        for n in range(total_samples):
            phase = 2 * math.pi * frequency * (n / SAMPLE_RATE)
            envelope = 1.0
            if n < fade_samples:
                envelope *= n / fade_samples
            if total_samples - n <= fade_samples:
                envelope *= (total_samples - n) / fade_samples
            value = amplitude * math.sin(phase) * envelope
            data.append(int(value))

    with wave.open(str(wav_path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(BIT_DEPTH // 8)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(data.tobytes())

    return wav_path


def _escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def save_pdf(melody: Iterable[Tuple[int, float]], filename: str) -> Path:
    pdf_path = _melody_filename(filename, "pdf")
    lines = [f"{index:02d}. Pitch: {pitch} • Duration: {duration} beats" for index, (pitch, duration) in enumerate(melody, start=1)]

    content_lines = [
        "BT",
        "/F1 18 Tf",
        "1 0 0 1 72 750 Tm",
        f"({_escape_pdf_text('AI Generated Melody')}) Tj",
        "0 -24 Td",
        "/F1 12 Tf",
        f"({_escape_pdf_text('Pitch / Duration (beats)')}) Tj",
        "0 -18 Td",
        "14 TL",
    ]

    for line in lines:
        content_lines.append(f"({_escape_pdf_text(line)}) Tj")
        content_lines.append("T*")

    content_lines.append("ET")
    stream = "\n".join(content_lines).encode("utf-8")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    with pdf_path.open("wb") as pdf_file:
        pdf_file.write(b"%PDF-1.4\n")
        offsets: List[int] = []
        for index, obj in enumerate(objects, start=1):
            offsets.append(pdf_file.tell())
            pdf_file.write(f"{index} 0 obj\n".encode("ascii"))
            pdf_file.write(obj)
            pdf_file.write(b"\nendobj\n")
        xref_position = pdf_file.tell()
        pdf_file.write(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
        pdf_file.write(b"0000000000 65535 f \n")
        for offset in offsets:
            pdf_file.write(f"{offset:010d} 00000 n \n".encode("ascii"))
        pdf_file.write(b"trailer\n")
        pdf_file.write(f"<< /Size {len(objects) + 1} /Root 1 0 R >>\n".encode("ascii"))
        pdf_file.write(b"startxref\n")
        pdf_file.write(f"{xref_position}\n".encode("ascii"))
        pdf_file.write(b"%%EOF")

    return pdf_path


def render_outputs(
    melody: Iterable[Tuple[int, float]],
    tempo: int,
    stem: str,
    preferred_wav: Optional[Path] = None,
) -> Tuple[Path, Path, Path]:
    midi = save_midi(melody, tempo, stem)
    wav = preferred_wav if preferred_wav is not None else save_wav(melody, tempo, stem)
    pdf = save_pdf(melody, stem)
    return wav, midi, pdf


def compose(lyrics: str, emotion: str, genre: str, tempo: int) -> Tuple[Path, Path, Path]:
    melody = generate_melody(lyrics, emotion, genre, tempo)
    stem = f"composition_{abs(hash((lyrics, emotion, genre, tempo))) % 1_000_000}"

    wav_path: Optional[Path] = None
    if callable(try_musicgen):
        try:
            wav_path = try_musicgen(lyrics, emotion, genre, tempo, stem)
        except Exception as exc:  # pragma: no cover - MusicGen failures fall back to procedural output
            print(f"MusicGen integration failed, falling back to synthesised audio: {exc}")

    return render_outputs(melody, tempo, stem, preferred_wav=wav_path)


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
