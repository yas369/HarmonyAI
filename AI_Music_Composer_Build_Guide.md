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

---

## 💡 Extra: Style Transfer Logic (TensorFlow)
Add optional `/style-transfer` route in Python AI to adapt music style:
```python
@app.post("/style-transfer")
def apply_style(input: StyleInput):
    transferred = tf_style_transfer(input.midi, input.target_genre)
    return save_and_upload(transferred)
```

---

## ✅ MVP Completion Checklist
- [ ] Frontend UI with forms & audio player  
- [ ] Backend API routes wired to AI engine  
- [ ] Hugging Face Space running FastAPI service  
- [ ] Firebase upload working  
- [ ] Outputs (WAV, MIDI, PDF) generated  
- [ ] Tested local and cloud end-to-end  

---

## 🏁 End Result
A **complete, multi-cloud AI music composer** that:
- Accepts lyrics, emotion, genre  
- Generates Indian-style compositions  
- Outputs WAV, MIDI, PDF  
- Stores results online  
- Runs on **free cloud infrastructure**

---
