import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
  firebaseBucket: process.env.FIREBASE_BUCKET ?? "",
  firebaseCredentials: process.env.FIREBASE_CREDENTIALS,
};
