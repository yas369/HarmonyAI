import admin from "firebase-admin";

import { config } from "./env";

let initialized = false;
let enabled = true;

export function initFirebase(): void {
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

export function storageBucket(): admin.storage.Storage | null {
  if (!initialized) {
    initFirebase();
  }

  return enabled ? admin.storage() : null;
}
