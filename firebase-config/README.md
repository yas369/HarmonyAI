# Firebase Configuration

Place your Firebase web configuration and service account credentials in this directory.

## Web Config (Frontend)

Create `firebaseConfig.js` with:

```js
export const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
};
```

## Service Account (Backend)

You can provide your Firebase Admin SDK credentials in either of the following ways:

1. Set the `FIREBASE_CREDENTIALS` environment variable to the JSON representation of your service account.
2. Drop the JSON file into this directory as `serviceAccountKey.json`. The backend now detects this file automatically (or you can point to a different location via the `FIREBASE_CREDENTIALS_FILE` environment variable).

When using a local file, ensure the JSON object matches the structure provided in `serviceAccountKey.json` and that sensitive keys are stored securely when committing changes.
