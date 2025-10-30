const { Router } = require("express");

const { requestComposition } = require("../services/aiClient");
const { uploadFile } = require("../services/storage");

const router = Router();

router.post("/generate", async (req, res, next) => {
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

function buildDestination(body, extension) {
  const genreSlug = String(body.genre || "track")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const emotionSlug = String(body.emotion || "mood").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const stem = `${Date.now()}_${genreSlug}_${emotionSlug}`;
  return `compositions/${stem}.${extension}`;
}

module.exports = router;
