import { Router } from "express";

import { requestComposition } from "../services/aiClient";
import { uploadFile } from "../services/storage";
import { GenerateRequestBody, GenerateResponse } from "../types/composition";

const router = Router();

router.post<{}, GenerateResponse, GenerateRequestBody>("/generate", async (req, res, next) => {
  try {
    const composition = await requestComposition(req.body);

    const [audioUrl, midiUrl, pdfUrl] = await Promise.all([
      uploadFile(composition.audio, buildDestination(req.body, "wav")),
      uploadFile(composition.midi, buildDestination(req.body, "mid")),
      uploadFile(composition.pdf, buildDestination(req.body, "pdf")),
    ]);

    res.json({
      audio: audioUrl,
      midi: midiUrl,
      pdf: pdfUrl,
    });
  } catch (error) {
    next(error);
  }
});

function buildDestination(body: GenerateRequestBody, extension: string): string {
  const slug = body.genre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stem = `${Date.now()}_${slug}_${body.emotion.toLowerCase()}`;
  return `compositions/${stem}.${extension}`;
}

export default router;
