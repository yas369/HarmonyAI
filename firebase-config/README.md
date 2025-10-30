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

Set the `FIREBASE_CREDENTIALS` environment variable to the JSON representation of your Firebase service account to enable authenticated uploads from the backend.
