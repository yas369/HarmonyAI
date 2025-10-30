const admin = require("firebase-admin");
const path = require("path");
const { config } = require("./env");

let initialized = false;
let enabled = true;

function initFirebase() {
  if (initialized) {
    return;
  }

  try {
    let credentials;

    // 🔹 Option 1: Prefer local JSON file if it exists
    const serviceAccountPath = path.resolve("firebase-service-account.json");
    try {
      credentials = require(serviceAccountPath);
      console.log("Firebase credentials loaded from local JSON file.");
    } catch (fileErr) {
      // 🔹 Option 2: Fallback to credentials from .env
      if (!config.firebaseCredentials || !config.firebaseBucket) {
        enabled = false;
        console.warn("Firebase credentials missing; uploads will return local file paths.");
        initialized = true;
        return;
      }
      console.log("Firebase credentials loaded from .env.");
      credentials = JSON.parse(config.firebaseCredentials);
    }

    // 🔹 Initialize Firebase
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      storageBucket: config.firebaseBucket || process.env.FIREBASE_BUCKET,
    });

    initialized = true;
    console.log("Firebase initialized successfully.");
  } catch (error) {
    enabled = false;
    initialized = true;
    console.error("❌ Failed to initialize Firebase:", error.message);
  }
}

function storageBucket() {
  if (!initialized) {
    initFirebase();
  }
  return enabled ? admin.storage() : null;
}

module.exports = { initFirebase, storageBucket };
