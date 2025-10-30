const admin = require("firebase-admin");

const { config } = require("./env");

let initialized = false;
let enabled = true;

function initFirebase() {
  if (initialized) {
    return;
  }

  if (!config.firebaseCredentials || !config.firebaseBucket) {
    enabled = false;
    console.warn("Firebase credentials missing; uploads will return local file paths.");
    initialized = true;
    return;
  }

  const credentials = JSON.parse(config.firebaseCredentials);

  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    storageBucket: config.firebaseBucket,
  });

  initialized = true;
}

function storageBucket() {
  if (!initialized) {
    initFirebase();
  }

  return enabled ? admin.storage() : null;
}

module.exports = { initFirebase, storageBucket };
