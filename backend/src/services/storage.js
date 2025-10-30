const fs = require("fs/promises");
const path = require("path");
const { extname } = require("path");

const { storageBucket } = require("../config/firebase");

async function uploadFile(filePath, destination) {
  const storageService = storageBucket();
  if (!storageService) {
    return saveLocally(filePath, destination);
  }

  const bucket = storageService.bucket();
  const file = bucket.file(destination);

  await bucket.upload(filePath, {
    destination,
    public: true,
    metadata: {
      cacheControl: "public, max-age=31536000",
      contentType: contentTypeForExtension(extname(filePath)),
    },
  });

  const [metadata] = await file.getMetadata();
  return metadata.mediaLink || file.publicUrl();
}

function contentTypeForExtension(ext) {
  switch (ext.toLowerCase()) {
    case ".wav":
      return "audio/wav";
    case ".mid":
    case ".midi":
      return "audio/midi";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

async function saveLocally(filePath, destination) {
  const sanitized = String(destination).replace(/^[\/]+/, "");
  const mediaRoot = path.resolve(__dirname, "../../public");
  const targetPath = path.resolve(mediaRoot, sanitized);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(filePath, targetPath);
  return `/media/${sanitized.replace(/\\/g, "/")}`;
}

module.exports = { uploadFile };
