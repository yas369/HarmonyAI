let admin = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  admin = require("firebase-admin");
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") {
    throw error;
  }
}

const { config } = require("./env");

let initialized = false;
let enabled = true;

function initFirebase() {
  if (initialized) {
    return;
  }

  if (!admin || !config.firebaseCredentials || !config.firebaseBucket) {
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
