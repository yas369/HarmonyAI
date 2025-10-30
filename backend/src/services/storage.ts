import { extname } from "path";

import { storageBucket } from "../config/firebase";

export async function uploadFile(
  filePath: string,
  destination: string
): Promise<string> {
  const bucket = storageBucket();
  if (!bucket) {
    return filePath;
  }

  const storage = bucket.bucket();
  const file = storage.file(destination);
  await storage.upload(filePath, {
    destination,
    public: true,
    metadata: {
      cacheControl: "public, max-age=31536000",
      contentType: contentTypeForExtension(extname(filePath)),
    },
  });

  const [metadata] = await file.getMetadata();
  return metadata.mediaLink as string;
}

function contentTypeForExtension(ext: string): string {
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
