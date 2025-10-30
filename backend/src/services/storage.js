const { extname } = require("path");

const { storageBucket } = require("../config/firebase");

async function uploadFile(filePath, destination) {
  const storageService = storageBucket();
  if (!storageService) {
    return filePath;
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

module.exports = { uploadFile };
