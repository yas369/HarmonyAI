# 🎶 AI Music Composer for Regional Styles — Fullstack Application Build Guide

## 🧭 Objective
Build a **Generative AI Music Composer** web application that can compose music in Indian regional genres like **Carnatic, Hindustani, Sufi, and Bollywood Fusion**.  
The system should generate **melodies, harmonies, and percussion tracks** based on user input such as **lyrics, mood, and genre**, then export results in **WAV, MIDI, and PDF sheet music** formats.

---

## 🏗️ Final Cloud Architecture (Free Stack)
| Component | Platform | Purpose |
|------------|-----------|----------|
| **Frontend (React)** | **Vercel** | User Interface |
| **Backend (Node.js)** | **Railway.app** | API Gateway & Middleware |
| **AI Composer (Python)** | **Hugging Face Spaces** | Magenta, Riffusion, TensorFlow Engine |
| **Storage** | **Firebase** | Stores generated files (WAV, MIDI, PDF) |

### System Flow:
```
User (Vercel React)
   ↓
Node.js API (Railway)
   ↓
Python AI Engine (Hugging Face)
   ↓
Firebase Storage (Files & Links)
   ↓
Result displayed in Frontend
```

---

## ⚙️ Tech Stack

### AI Components
- **Magenta** or **Riffusion** → Music generation (melody, harmony, percussion)
- **TensorFlow** → Style transfer (genre adaptation)
- **Python FastAPI** → Wraps AI logic into HTTP endpoints

### Web Components
- **React.js (Vite)** → Modern frontend
- **Node.js (Express)** → Backend REST API
- **Firebase SDK** → File uploads/downloads
- **Axios / Fetch** → HTTP communication between layers

### Output Formats
- `.wav` — Generated audio
- `.mid` — Music data (MIDI)
- `.pdf` — Sheet notation

---

## 🗂️ Folder Structure

```
/ai-music-composer
  /frontend         → React app (Vercel)
  /backend          → Node.js API (Railway)
  /composer-ai      → Python Magenta/TensorFlow service (Hugging Face)
  /firebase-config  → Firebase setup and credentials
  /output           → Temporary generated files
```

---

## 🧩 Backend API Design (Node.js / Express)

### `/generate`
**POST**  
Generates music composition using Hugging Face model.

**Request Body:**
```json
{
  "lyrics": "Ennai thottu alli kondu po...",
  "emotion": "love",
  "genre": "Carnatic",
  "tempo": 90
}
```

**Response:**
```json
{
  "audio": "https://firebasestorage.googleapis.com/.../composition.wav",
  "midi": "https://firebasestorage.googleapis.com/.../composition.mid",
  "pdf": "https://firebasestorage.googleapis.com/.../composition.pdf"
}
```

### Recommended Project Layout

```
/backend
  /src
    /routes
      generateRoute.ts
    /services
      aiClient.ts
      firebaseClient.ts
    /utils
      logger.ts
  package.json
  tsconfig.json (optional but encouraged)
```

Keeping orchestration logic inside dedicated service files prevents the Express route from being overloaded with implementation details and simplifies testing.

### Sample Implementation Skeleton

```ts
// src/routes/generateRoute.ts
import { Router } from "express";
import { requestComposition } from "../services/aiClient";
import { uploadComposition } from "../services/firebaseClient";

const router = Router();

router.post("/generate", async (req, res, next) => {
  try {
    const { lyrics, emotion, genre, tempo } = req.body;
    const aiResponse = await requestComposition({ lyrics, emotion, genre, tempo });

    const uploaded = await uploadComposition(aiResponse.files);

    res.json(uploaded);
  } catch (error) {
    next(error);
  }
});

export default router;
```

```ts
// src/services/aiClient.ts
import axios from "axios";

const baseUrl = process.env.AI_SERVICE_URL as string;

export async function requestComposition(payload: {
  lyrics: string;
  emotion: string;
  genre: string;
  tempo: number;
}) {
  const { data } = await axios.post(`${baseUrl}/compose`, payload, {
    timeout: 180000, // allow up to 3 minutes for model inference
  });
  return data;
}
```

```ts
// src/services/firebaseClient.ts
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { readFile } from "fs/promises";
import path from "path";

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG_JSON || "{}");

const app = initializeApp(firebaseConfig);
const storage = getStorage(app, `gs://${process.env.FIREBASE_BUCKET}`);

export async function uploadComposition(files: {
  wav: string;
  midi: string;
  pdf: string;
}) {
  const uploads = await Promise.all(
    Object.entries(files).map(async ([type, filePath]) => {
      const fileBuffer = await readFile(filePath);
      const storageRef = ref(storage, `compositions/${path.basename(filePath)}`);
      await uploadBytes(storageRef, fileBuffer, {
        contentType: type === "pdf" ? "application/pdf" : type === "midi" ? "audio/midi" : "audio/wav",
      });
      const url = await getDownloadURL(storageRef);
      return [type, url] as const;
    })
  );

  return Object.fromEntries(uploads);
}
```

> **Tip:** Centralize error handling using an Express error middleware to capture issues from Firebase or the AI service and return user-friendly messages.

---

## 🧠 AI Composer Service (Python / FastAPI)

### Overview
Implements generative logic using Magenta and TensorFlow models.

**Endpoints:**
- `POST /compose` → Generates music
- `POST /style-transfer` → Applies genre adaptation
- `GET /health` → Checks model status

**Libraries:**
```python
pip install magenta tensorflow fastapi uvicorn music21 pretty_midi pydub
```

**Example (Simplified):**
```python
@app.post("/compose")
def compose_music(input: InputData):
    melody = magenta_generate(input.lyrics, input.emotion, input.genre)
    audio_path, midi_path, pdf_path = render_outputs(melody)
    upload_to_firebase(audio_path, midi_path, pdf_path)
    return {"audio": audio_url, "midi": midi_url, "pdf": pdf_url}
```

### Detailed Composition Flow

1. **Lyric & Mood Embedding** – Convert the provided lyrics and emotion into embeddings (e.g., using a pre-trained multilingual BERT or sentence-transformers model). These embeddings condition the Magenta/Riffusion generator for melodic contours.
2. **Base Melody Generation** – Use Magenta's `music_rnn` or `melody_rnn` to create the melodic line. Parameters like `steps_per_quarter` and `temperature` should adapt to the requested tempo and emotion.
3. **Harmony & Percussion Layering** – Generate chord progressions using Magenta's `chord_pitches_improv` model and create percussion loops with TensorFlow-trained rhythm models. Combine using `pretty_midi` to maintain timing alignment.
4. **Genre Style Transfer** – Pass the combined MIDI through a TensorFlow style-transfer network that has been fine-tuned on Carnatic, Hindustani, Sufi, and Bollywood Fusion datasets. This adjusts ornamentation and rhythmic accents.
5. **Audio Rendering** – Convert the final MIDI to WAV via a soundfont (e.g., FluidSynth) tailored for Indian instruments. Use `pydub` for final mastering (normalization and fade-outs).
6. **Sheet Music Generation** – Use `music21` to parse the MIDI and export PDF sheet notation, embedding raga information or taal annotations when available.

### FastAPI Directory Structure

```
/composer-ai
  app.py
  /models
    melody_rnn.ckpt
    style_transfer.h5
  /services
    generators.py
    renderers.py
    firebase.py
  /schemas
    compose.py
  requirements.txt
```

Breaking functionality into `services` modules makes it easier to swap out model versions and write unit tests targeting each step of the pipeline.

---

## 🎨 Frontend UI/UX (React + Vercel)

### Design Goals
- Smooth, modern, minimal interface
- Emphasize **emotion + genre input**
- Provide clear feedback: *"Composing your music..."*
- Easy audio playback and export buttons

### Components
1. **Home Page**
   - Title: “🎶 AI Music Composer”
   - Input fields: Lyrics (textarea), Emotion (dropdown), Genre (dropdown), Tempo (slider)
   - Button: `Generate Music`
2. **Progress Screen**
   - Animated loader + progress text
   - Display “Composing your track...”
3. **Results Page**
   - Embedded audio player
   - Buttons: `Download WAV`, `Download MIDI`, `Download PDF`
   - Feedback section: “Was this result accurate?” (1–5 stars)

### Folder Example
```
/frontend/src
  /components
    InputForm.jsx
    Loader.jsx
    ResultCard.jsx
  /pages
    Home.jsx
  /api
    api.js
  /styles
    app.css
```

**Install:**
```bash
npm create vite@latest frontend --template react
npm install axios
```

**API Call Example:**
```js
axios.post('https://your-railway-api/generate', {
  lyrics, emotion, genre, tempo
})
.then(res => setResults(res.data))
.catch(err => console.error(err));
```

### State Management & Data Fetching

- Use React Query or SWR to manage API request state, automatic retries, and caching of composition results.
- Keep form state in a dedicated hook (`useComposerForm`) to simplify validation (e.g., required lyrics, tempo range 60–160 BPM).
- Provide optimistic UI feedback by switching to the progress screen immediately after form submission and listening for server-sent events (optional) to show generation progress.

### Example React Query Mutation

```tsx
import { useMutation } from "@tanstack/react-query";
import { generateComposition } from "../api/api";

export function useGenerateComposition() {
  return useMutation({
    mutationFn: generateComposition,
    retry: 1,
    onError: (error) => {
      console.error("Failed to compose", error);
    },
  });
}
```

```tsx
// src/api/api.ts
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
});

export async function generateComposition(payload) {
  const { data } = await client.post("/generate", payload);
  return data;
}
```

### Accessibility Considerations

- Provide descriptive labels and aria-live regions for progress updates.
- Ensure the audio player supports keyboard controls and that download buttons include `aria-label`s describing the file type.
- Use high-contrast color palettes and test with screen readers (NVDA/VoiceOver).

---

## 🔥 Firebase Configuration (firebase-config/)

1. Create Firebase Project → Enable Storage
2. Get config snippet:
```js
export const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "musicapp.firebaseapp.com",
  projectId: "musicapp",
  storageBucket: "musicapp.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123:web:abc..."
};
```
3. Use in Node.js:
```js
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
```

Store the Firebase config JSON in Railway environment variables to avoid committing secrets. During local development, use `.env.local` files that are excluded from version control.

---

## 🔗 Integration Workflow

**Frontend (React)** → sends JSON → **Backend (Railway Node.js)**  
→ forwards request → **AI Composer (Hugging Face FastAPI)**  
→ generates files → uploads to **Firebase Storage**  
→ returns public URLs → displayed in **Frontend player**

---

## 💾 File Output Paths
```
/output/
  composition.wav
  composition.mid
  composition.pdf
```
All uploaded to Firebase, links stored in response.

---

## 🧰 Environment Variables
Each service needs `.env`:

### Frontend (Vercel)
```
VITE_API_URL=https://your-railway-app.up.railway.app
```

### Backend (Railway)
```
AI_SERVICE_URL=https://huggingface.co/yourspace
FIREBASE_BUCKET=musicapp.appspot.com
```

### Python AI (Hugging Face)
```
FIREBASE_API_KEY=AIza...
MODEL_PATH=/models/music_transformer/
```

Include additional variables for style-transfer weights or optional telemetry (e.g., `SENTRY_DSN`) as needed. Validate env vars at startup using packages like `zod` (Node.js) or `pydantic` (FastAPI) to fail fast when configuration is missing.

---

## 🧪 Local Run Instructions
```bash
# Backend
cd backend && npm install && npm run dev

# AI Composer
cd composer-ai && python app.py

# Frontend
cd frontend && npm install && npm run dev
```
Then test at `http://localhost:5173`

---

## 🔍 Testing & Quality Assurance

- **Unit Tests**: Use Jest for backend service functions (AI client, Firebase uploader) and PyTest for Python services to validate MIDI rendering logic.
- **Integration Tests**: Create end-to-end tests that hit the `/generate` endpoint with sample payloads using supertest and mock Firebase with the emulator suite.
- **Frontend Tests**: Employ React Testing Library to ensure form validation and loading states render correctly.
- **Audio Regression**: Maintain a small set of golden MIDI/WAV files and compare generated outputs via spectral similarity metrics to detect regressions.

Add GitHub Actions workflows to lint, test, and build each package on pull requests before deploying to Vercel, Railway, or Hugging Face.

---

## 📦 Deployment Steps

### 1. Deploy Frontend → Vercel
- Connect GitHub repo  
- Choose `/frontend` as root  
- Set `VITE_API_URL` env variable  

### 2. Deploy Backend → Railway
- Connect same repo  
- Choose `/backend` path  
- Add `AI_SERVICE_URL` and Firebase vars  

### 3. Deploy AI Composer → Hugging Face Spaces
- Choose “FastAPI” template  
- Upload `/composer-ai` folder  
- Configure Python dependencies  

### 4. Set Up Firebase
- Create new project
- Enable Storage and CORS for public download
- Configure lifecycle rules to automatically delete compositions after a retention period (e.g., 7 days) if long-term storage is not required.

---

## 💡 Extra: Style Transfer Logic (TensorFlow)
Add optional `/style-transfer` route in Python AI to adapt music style:
```python
@app.post("/style-transfer")
def apply_style(input: StyleInput):
    transferred = tf_style_transfer(input.midi, input.target_genre)
    return save_and_upload(transferred)
```

Consider exposing an additional `strength` parameter that allows users to control how aggressively the target genre characteristics override the base composition. Keep inference times reasonable by caching intermediate embeddings keyed by lyric hash.

---

## ✅ MVP Completion Checklist
- [ ] Frontend UI with forms & audio player  
- [ ] Backend API routes wired to AI engine  
- [ ] Hugging Face Space running FastAPI service  
- [ ] Firebase upload working
- [ ] Outputs (WAV, MIDI, PDF) generated
- [ ] Tested local and cloud end-to-end
- [ ] Automated test suite passing across frontend, backend, and AI services
- [ ] Observability (logs/metrics) configured for each deployment target

---

## 🏁 End Result
A **complete, multi-cloud AI music composer** that:
- Accepts lyrics, emotion, genre  
- Generates Indian-style compositions  
- Outputs WAV, MIDI, PDF  
- Stores results online  
- Runs on **free cloud infrastructure**

---

---

## 📁 Repository Implementation Overview

The repository now includes production-ready scaffolding for every layer described above.

### Backend (`/backend`)
- `src/server.ts` boots an Express application with CORS, JSON parsing, and a health probe.
- `src/routes/generate.ts` validates incoming composition payloads, calls the AI composer, and uploads generated files to Firebase Storage (or returns local paths when credentials are absent for local development).
- `src/services/aiClient.ts` handles the HTTP bridge to the Python FastAPI service.
- `src/services/storage.ts` abstracts Firebase uploads with sensible MIME types and cache headers.
- Environment variables are loaded through `src/config/env.ts`; copy `.env.example` and populate the values before running `npm run dev`.

### AI Composer (`/composer-ai`)
- `app/main.py` exposes `/compose`, `/style-transfer`, and `/health` endpoints via FastAPI.
- `app/generation.py` synthesizes deterministic melodies based on lyrics, emotion, and genre, exporting WAV, MIDI, and PDF files using `midiutil` and `reportlab`.
- Install dependencies with `pip install -r requirements.txt` and start the server with `uvicorn app.main:app --reload`.

### Frontend (`/frontend`)
- Vite-powered React single-page app with stateful orchestration inside `src/pages/Home.jsx`.
- UI primitives (`InputForm`, `Loader`, `ResultCard`) reside in `src/components` and consume styles from `src/styles/app.css`.
- API calls are centralized in `src/api/api.js`, reading the backend base URL from `VITE_API_URL`.
- Run `npm install` then `npm run dev` to launch the Vite dev server.

### Firebase Configuration (`/firebase-config`)
- Reference instructions and placeholders for both the frontend web config and backend service account JSON.

### Local Orchestration
1. Start the FastAPI composer: `cd composer-ai && uvicorn app.main:app --reload`.
2. Run the Express API: `cd backend && npm install && npm run dev`.
3. Launch the React frontend: `cd frontend && npm install && npm run dev`.
4. Visit `http://localhost:5173` and submit the composition form.

Generated assets are saved to `/composer-ai/output` before being uploaded or returned to the frontend.
