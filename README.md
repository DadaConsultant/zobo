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
- **Video Recording** — The full session is recorded as one `webm` (camera video + **mixed audio**: microphone + AI TTS so employers hear both sides) and uploaded to Vercel Blob
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
| `UPSTASH_REDIS_REST_URL` | [Upstash Redis](https://console.upstash.com) REST URL — powers API rate limiting (auth, OpenAI, ElevenLabs routes). If omitted, limits are skipped (fine for local dev). |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token (pair with URL above). |

**Rate limits (when Upstash is configured):** register / forgot-password / reset-password share **10 requests per 15 minutes per IP**; credentials sign-in **30 per 15 minutes per IP**; recruiter OpenAI (job create + script preview) **40 per hour per user**; candidate interview OpenAI (message, STT, complete, abandon) **200 per hour per IP**; ElevenLabs TTS **150 per hour per IP**. All return **429** with a `Retry-After` header when exceeded.

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

A **continuous `MediaRecorder`** starts when the interview phase begins. The stream passed to it is **not** the raw camera stream alone: a **Web Audio** graph mixes **microphone** + **AI TTS** (`<audio>` via `createMediaElementSource`) into a `MediaStreamDestination`, and that mixed audio is combined with the **camera video track** into one `MediaStream`. That way the saved `video/webm` includes what the candidate said **and** what Zobo said. (The microphone is **not** routed to `AudioContext.destination`, to avoid speaker echo.)

**Per-answer STT** still uses **only the raw mic** tracks from the original `getUserMedia` stream — not the mixed stream — so Whisper gets clean candidate speech.

Chunks are collected every second until `completeInterview()` stops the recorder.

---

### 4. Interview flow (candidate experience & state machine)

This is the authoritative description of how a session runs. Use it when changing `interview-client.tsx`, `message/route.ts`, or `generateAIResponse()` in `openai.ts`.

#### 4a. Before the first question

1. **Entry** — Candidate opens `/interview/[token]`, verifies email, submits **Start interview**.
2. **`POST /api/interviews`** — Creates `Interview` (`IN_PROGRESS`), returns `interviewId` + `interviewScript` (shared script from the job).
3. **Permission** — Browser prompts for camera + mic; stream is stored in a ref for preview, STT, and recording setup.
4. **Interview UI** — Short **countdown**; intro + first question text are **pre-fetched** via TTS when possible.
5. **First AI turn** — Transcript is seeded with the intro + first question; `speakText()` plays TTS, then (~600ms later) the mic opens for the candidate.

#### 4b. Scripted structure (per question)

The script has **N questions** (`questions[]`). For **each** question the client runs **two candidate turns** before moving on:

| Turn | `followUpCount` (before processing) | Meaning |
|------|-------------------------------------|---------|
| 1st answer on this question | `0` | Main answer → AI should **follow up** on the same question (`replyPhase: "follow_up"`). |
| 2nd answer on this question | `1` | Follow-up answer → AI either **advances** to the next question (`replyPhase: "advance"`) or **closes** if this was the last question (`replyPhase: "closing"`). |

After the 2nd answer on a non-final question: `questionIndex++`, `followUpCount` resets to `0`.  
After the 2nd answer on the **final** question: the session **must** end (see below).

This is **fixed logic** on the client — the model does not choose how many turns per question; it only fills in what to **say** for the current phase.

#### 4c. One full cycle (after AI has spoken)

1. **Candidate answers** — Mic recording auto-starts after AI audio ends; candidate taps **Stop — send answer** when finished.
2. **STT** — `POST /api/interviews/[id]/stt` (Whisper) → transcript text.
3. **`POST /api/interviews/[id]/message`** — Body includes:
   - `transcript` (including the new candidate line),
   - `currentQuestion`,
   - `nextQuestion` — sent **only** when `replyPhase === "advance"` (the **next** scripted question object, or `null` if none),
   - **`replyPhase`** — `"follow_up"` | `"advance"` | `"closing"` (must match the client state machine).

4. **`generateAIResponse()`** (`openai.ts`) — Uses `replyPhase` to pick **different system instructions**:
   - **`follow_up`** — Stay on the same question; one concise follow-up; **do not** close the interview.
   - **`advance`** — Acknowledge, then naturally transition into `nextQuestion.text` (no robotic “question two” labels).
   - **`closing`** — Warm closing: thank them, recruiter will follow up, wish them well; **no** further interview questions.

   The model returns **JSON only**: `{ "message": "<spoken reply>", "endSession": boolean }`.  
   - For `replyPhase === "closing"`, **`endSession` is forced to `true`** in code.  
   - For other phases, if the candidate **clearly asks to stop** (“I need to go”, “end the interview”, etc.), the model should set **`endSession: true`** and give a short closing; the client will then finish the session early.

5. **Client** (`processAudio`) — Plays `message` via TTS. Then:
   - If **`(shouldAdvance && isLastQuestion) || endSession`** → **`completeInterview()`** (upload video, save transcript, evaluate).
   - Else apply follow-up vs advance: bump `followUpCount` or increment `questionIndex` / reset `followUpCount`, append AI line to transcript, continue.

#### 4d. Why `replyPhase` exists

Previously, `nextQuestion === null` was overloaded to mean “final closing” in the prompt, but the client sent `null` on **every** first answer to a question (follow-up round), so the model was often told it was on the **final** question when it was not. **`replyPhase` disambiguates** follow-up vs advance vs real closing.

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
Candidate opens /interview/[token] → verifies email → grants camera+mic
        │
        ▼
POST /api/interviews → Interview (IN_PROGRESS) + script
        │
        ▼
Countdown → intro + Q1 (TTS) → MediaRecorder (camera + mixed mic+TTS audio)
        │
        ▼
┌── Loop per turn ─────────────────────────────────────────────────┐
│  Candidate speaks → Stop → STT → POST .../message               │
│  (replyPhase: follow_up → advance → … → closing)                 │
│  JSON { message, endSession } — close if last Q + advance OR      │
│  endSession (e.g. candidate asked to stop)                       │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
completeInterview() after closing TTS
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
