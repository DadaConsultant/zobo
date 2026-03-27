# Zobo Jobs — AI-Powered Interview Platform

> **Send one link. Get your top candidates.**

Zobo Jobs replaces first-round screening interviews with an AI video interview agent. Recruiters create a job, share a link, and receive a ranked shortlist with detailed scores, an AI summary, and a full video recording of each candidate — all automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes (Node.js) |
| Database | MySQL + Prisma ORM |
| Auth | NextAuth v5 (Credentials) |
| AI: LLM | OpenAI GPT-4o-mini |
| AI: STT | OpenAI Whisper |
| AI: TTS | ElevenLabs (`eleven_turbo_v2_5`) |
| Video Storage | Vercel Blob |
| Email | Nodemailer |

---

## Features

- **Job Creation** — Create a job with title, description, skills, experience level, and custom questions
- **AI Interview Script** — GPT-4o-mini auto-generates a tailored 6–8 question interview script on job creation
- **Shareable Interview Link** — One unique link per job (`/interview/[token]`)
- **AI Video Interview Engine** — Full video interview: ElevenLabs TTS asks questions, Whisper STT transcribes answers, GPT drives follow-ups
- **Video Recording** — The entire interview session is recorded (camera + mic) and uploaded to Vercel Blob
- **Camera Enforcement** — If the candidate turns off their camera mid-interview, the session is paused until video is restored
- **Candidate Scoring** — Auto-scored on technical knowledge, communication, problem solving, experience fit, and confidence
- **Video Playback** — Recruiters can watch the full interview recording on the candidate review page
- **Top Candidates** — Auto-surfaced top 3 candidates after completion
- **Recruiter Dashboard** — Jobs list, candidate rankings, video playback, interview transcripts, and AI summaries
- **Email Invites** — Send direct email invites or upload a CSV, with automated reminders

---

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd zobo
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in all variables — see the full table in [Environment Variables](#environment-variables).

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** The dev script uses Webpack (`--webpack`) instead of Turbopack and caps Node.js memory at 3 GB to prevent crashes on memory-constrained machines.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string (e.g. Railway) |
| `NEXTAUTH_URL` | Full public URL of the app (`https://your-app.vercel.app`) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Same as `NEXTAUTH_URL` |
| `OPENAI_API_KEY` | From [platform.openai.com](https://platform.openai.com) |
| `ELEVENLABS_API_KEY` | From [elevenlabs.io](https://elevenlabs.io) |
| `ELEVENLABS_VOICE_ID` | Voice ID from your ElevenLabs account |
| `BLOB_READ_WRITE_TOKEN` | Auto-set by Vercel when you connect a Blob store. Pull locally with `vercel env pull .env` |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email address |
| `SMTP_PASS` | Your email app password |
| `EMAIL_FROM` | e.g. `Zobo Jobs <noreply@yourdomain.com>` |
| `CRON_SECRET` | Run `openssl rand -base64 32` |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & signup pages
│   ├── (dashboard)/         # Protected recruiter dashboard
│   │   ├── dashboard/       # Overview + top candidates
│   │   ├── jobs/            # Job list, create, detail
│   │   └── candidates/[id]/ # Candidate detail: video, scores, transcript
│   ├── interview/[token]/   # Candidate-facing AI video interview
│   └── api/
│       ├── auth/            # NextAuth + register
│       ├── jobs/            # CRUD jobs + script generation on create
│       ├── interviews/      # Interview engine (see below)
│       │   ├── route.ts          # Start interview, return script
│       │   └── [id]/
│       │       ├── tts/          # Text-to-speech (ElevenLabs)
│       │       ├── stt/          # Speech-to-text (Whisper)
│       │       ├── message/      # AI follow-up / next question (GPT)
│       │       ├── complete/     # Save transcript + run evaluation
│       │       └── upload-video/ # Issue Blob upload token + save videoUrl
│       ├── candidates/      # Candidate queries
│       ├── invites/         # Email invite system
│       └── cron/reminders/  # Daily reminder emails
├── components/
│   ├── ui/                  # Reusable UI primitives
│   ├── dashboard/           # Dashboard-specific components
│   └── interview/
│       └── interview-client.tsx  # Full interview engine (client-side)
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── auth.ts              # NextAuth config
│   ├── openai.ts            # generateInterviewScript / generateAIResponse / evaluateInterview
│   ├── email.ts             # Nodemailer helpers
│   └── utils.ts             # Utilities + token generator
└── types/
    └── next-auth.d.ts       # Session type extensions
```

---

## Interview Engine — Developer Guide

This section explains how the interview system works end-to-end. Read this before touching any interview-related code.

### 1. Script Generation (one-time, per job)

**When:** At job creation (`POST /api/jobs`).  
**Function:** `generateInterviewScript()` in `src/lib/openai.ts`.  
**Model:** `gpt-4o-mini` with `response_format: json_object`.

The prompt instructs GPT to produce:
- An **introduction** string (AI introduces itself and the role)
- **6–8 questions**, each with:
  - `id` — unique string
  - `text` — the question
  - `type` — `technical | behavioral | situational | custom`
  - `followUpPrompt` — instruction for the AI to probe deeper if the answer is shallow
- A **scoring rubric** (used during evaluation, not during the interview itself)

The generated script is saved once into `job.interviewScript` (JSON column). All candidates for that job receive the same script — it is **never regenerated per candidate**.

Custom questions added by the recruiter at job creation are injected into the prompt and tagged as `type: "custom"`.

---

### 2. Starting an Interview

**Route:** `POST /api/interviews`  
**Called by:** The candidate entry form (`interview-client.tsx`).

Validates the `token` (unique interview link), creates or finds the `Candidate` record, creates an `Interview` record with status `IN_PROGRESS`, and returns:
```json
{
  "interviewId": "...",
  "interviewScript": { "introduction": "...", "questions": [...] }
}
```

---

### 3. Permission & Video Setup

Before the interview begins, `interview-client.tsx` requests **camera + microphone** access via `getUserMedia({ video: true, audio: true })`. A live camera preview is shown so the candidate can verify their setup.

A **continuous `MediaRecorder`** is started on the combined stream immediately when the interview phase begins. This records the entire session as a single `video/webm` file, collecting chunks every second.

---

### 4. The Interview Loop

Each cycle:

1. **AI speaks** — `speakText(text)` calls `POST /api/interviews/[id]/tts`, which calls ElevenLabs `textToSpeech.convert()` and streams back an audio blob. The client plays it via an `<audio>` element and resolves only when `audio.onended` fires.

2. **Candidate answers** — 600ms after audio ends, recording auto-starts using the audio tracks from the existing video stream (no second `getUserMedia` call needed). The candidate taps the red stop button when done.

3. **STT** — The audio blob is sent to `POST /api/interviews/[id]/stt`, which calls OpenAI Whisper and returns a transcript string.

4. **AI response** — `POST /api/interviews/[id]/message` calls `generateAIResponse()` in `openai.ts`, passing the full transcript, the current question, and the next question (or `null` if it's the last). GPT decides whether to follow up or transition.

5. **Advance or follow-up logic** (in `processAudio()`, `interview-client.tsx`):
   - If `followUpCount < 1` and the candidate hasn't answered enough → same question, follow-up
   - If `followUpCount >= 1` → advance to `questionIndex + 1`
   - If `questionIndex >= totalQuestions - 1` and it's time to advance → closing message → `completeInterview()`

---

### 5. Camera Enforcement

The camera is monitored via `videoTrack.onmute`, `videoTrack.onunmute`, and `videoTrack.onended`:

- **Camera off (`onmute`)** → AI audio stops, any in-progress answer is discarded (not sent to STT), the video recorder is **paused**, and a full-screen blocking overlay appears. The interview cannot continue.
- **Camera back (`onunmute`)** → video recorder **resumes**, the last AI message is replayed (so the candidate knows which question they were on), and the mic auto-starts after the AI finishes.
- **Camera access revoked (`onended`)** → same blocking overlay, but with a "Grant Camera Access" button that calls `getUserMedia` again.

---

### 6. Completing the Interview + Video Upload

**`completeInterview(finalTranscript)`** in `interview-client.tsx`:

1. Sets phase to `"uploading"` (shows a saving screen).
2. Stops the continuous `MediaRecorder` and waits for the final `ondataavailable` chunk via a `Promise` on the `stop` event.
3. Uploads the video **directly to Vercel Blob CDN** using `upload()` from `@vercel/blob/client` (bypasses the 4.5 MB serverless body limit — critical for large files).
4. Immediately calls `PUT /api/interviews/[id]/upload-video` with `{ videoUrl }` to save the URL to the database. This explicit PUT is the primary save path and works in both local dev and production. The `onUploadCompleted` callback in the server handler fires only in production (Vercel CDN can't reach `localhost`) and acts as a secondary redundant save.
5. Calls `POST /api/interviews/[id]/complete` with the full transcript. This triggers `evaluateInterview()` (GPT-4o-mini) which scores the candidate across 5 dimensions and writes all results to the database.
6. Releases all camera and microphone tracks.
7. Sets phase to `"complete"`.

> **Important:** Never send the video blob as FormData through a Next.js API route. Vercel serverless functions have a hard **4.5 MB request body limit**. A 10-minute interview video is typically 50–200 MB. Always use the `@vercel/blob/client` `upload()` function for direct CDN upload.

---

### 7. Candidate Evaluation

**Function:** `evaluateInterview()` in `src/lib/openai.ts`.  
**Model:** `gpt-4o-mini`, `temperature: 0.3` (low, for consistent scoring).

Returns:
```json
{
  "scores": {
    "technical_knowledge": 0-100,
    "communication": 0-100,
    "problem_solving": 0-100,
    "experience_fit": 0-100,
    "confidence": 0-100,
    "overall": 0-100
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "summary": "2-3 sentence summary",
  "recommendation": true | false
}
```

All fields are saved to the `Interview` record. The recruiter sees these on the candidate detail page alongside the video player and transcript.

---

### 8. Viewing Results (Recruiter)

**Page:** `/candidates/[id]`  
**File:** `src/app/(dashboard)/candidates/[id]/page.tsx`

If `interview.videoUrl` is set, a native `<video>` player is shown at the top of the results panel. Below it: AI summary, then the full conversation transcript. On the left: recommendation flag, score breakdown bars, strengths, and weaknesses.

---

### Interview Data Flow Summary

```
Recruiter creates job
        │
        ▼
generateInterviewScript() → saved to job.interviewScript (once, shared by all candidates)
        │
        ▼
Candidate opens /interview/[token] → enters name/email → grants camera+mic
        │
        ▼
POST /api/interviews → creates Interview record (IN_PROGRESS) → returns script
        │
        ▼
MediaRecorder starts (full session video/webm)
        │
        ▼
┌── AI speaks (ElevenLabs TTS) ──────────────────────────────────┐
│   Candidate answers (Whisper STT)                               │
│   POST /api/interviews/[id]/message (GPT follow-up or advance)  │
│   Repeat until last question answered                           │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
AI delivers closing message → completeInterview()
        │
        ├── upload() to Vercel Blob CDN → PUT videoUrl to DB
        └── POST /api/interviews/[id]/complete → evaluateInterview() → save scores
        │
        ▼
Recruiter reviews: video playback + scores + transcript + AI summary
```

---

## Database Commands

```bash
npx prisma db push       # Push schema changes (dev — no migration history)
npx prisma migrate dev   # Create a named migration (recommended for production changes)
npx prisma studio        # Open Prisma Studio GUI
```

---

## Deployment — Vercel + Railway

### Step 1 — Set up MySQL on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy MySQL**
2. Copy the **MySQL URL** from the Connect tab

### Step 2 — Push the schema

```bash
npx prisma db push
```

### Step 3 — Connect Vercel Blob

In your Vercel project → **Storage** → **Create Database** → **Blob**.  
This automatically sets `BLOB_READ_WRITE_TOKEN` as a Vercel environment variable.  
Pull it locally with:

```bash
vercel env pull .env
```

### Step 4 — Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Or connect via [vercel.com/new](https://vercel.com/new) — import your GitHub repo and Vercel auto-detects Next.js.

### Step 5 — Add environment variables in Vercel

Set all variables from the [Environment Variables](#environment-variables) table in **Vercel → Settings → Environment Variables**. `BLOB_READ_WRITE_TOKEN` is set automatically if you connected Blob in Step 3.

### Step 6 — Verify cron job

The reminder cron runs daily at 9am UTC (`vercel.json`):

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/reminders
```

---

## Roadmap

- [ ] Resume parsing
- [ ] Job landing pages
- [ ] LinkedIn sourcing
- [ ] Coding interview module
- [ ] Behavioral video analysis
- [ ] Fraud detection
- [ ] ATS integrations
