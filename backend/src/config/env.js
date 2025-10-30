const fs = require("fs");
const path = require("path");

try {
  // Optional dependency when running outside packaged environment
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const dotenv = require("dotenv");
  dotenv.config();
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") {
    throw error;
  }
}

function readFirebaseCredentials() {
  if (process.env.FIREBASE_CREDENTIALS) {
    return process.env.FIREBASE_CREDENTIALS;
  }

  const explicitPath = process.env.FIREBASE_CREDENTIALS_FILE;
  const defaultPath = path.resolve(
    __dirname,
    "../../../firebase-config/serviceAccountKey.json"
  );
  const candidatePath = explicitPath
    ? path.resolve(explicitPath)
    : defaultPath;

  try {
    const raw = fs.readFileSync(candidatePath, "utf8");
    JSON.parse(raw);
    return raw;
  } catch (error) {
    if (explicitPath) {
      console.warn(
        `Unable to read Firebase credentials file at ${candidatePath}:`,
        error.message
      );
    }
    return undefined;
  }
}

const config = {
  port: Number(process.env.PORT ?? 4000),
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
  firebaseBucket: process.env.FIREBASE_BUCKET ?? "",
  firebaseCredentials: readFirebaseCredentials(),
};

module.exports = { config };
