# Zobo Jobs — AI-Powered Interview Platform

> **Send one link. Get your top candidates.**

Zobo Jobs replaces first-round screening interviews with an AI voice interview agent. Recruiters create a job, share a link, and receive a ranked shortlist with detailed scores and insights — all automatically.

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
| AI: TTS | ElevenLabs |
| Email | Nodemailer |

---

## Features

- **Job Creation** — Create a job with title, description, skills, and custom questions
- **AI Interview Generation** — GPT-4o-mini generates a tailored 6–8 question interview script with scoring rubric
- **Shareable Interview Link** — One unique link per job (`/interview/[token]`)
- **AI Voice Interview Engine** — Real-time voice interview using ElevenLabs TTS + Whisper STT + GPT follow-ups
- **Candidate Scoring** — Auto-scored on technical knowledge, communication, problem solving, experience fit, and confidence
- **Top Candidates** — Auto-surfaced top 3 candidates after completion
- **Recruiter Dashboard** — Jobs list, candidate rankings, interview transcripts, and AI summaries
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

Fill in:
- `DATABASE_URL` — MySQL connection string (e.g. `mysql://user:pass@localhost:3306/zobo_jobs`)
- `NEXTAUTH_SECRET` — Run `openssl rand -base64 32` to generate
- `OPENAI_API_KEY` — From [platform.openai.com](https://platform.openai.com)
- `ELEVENLABS_API_KEY` — From [elevenlabs.io](https://elevenlabs.io)
- `ELEVENLABS_VOICE_ID` — Choose a voice from ElevenLabs
- SMTP credentials for email invites

### 3. Set up the database

```bash
# Push the schema to your MySQL database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Commands

```bash
npm run db:push       # Push schema changes (dev)
npm run db:migrate    # Create and run migrations
npm run db:studio     # Open Prisma Studio (GUI)
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & signup pages
│   ├── (dashboard)/         # Protected recruiter dashboard
│   │   ├── dashboard/       # Overview page
│   │   ├── jobs/            # Job list, create, detail
│   │   └── candidates/[id]/ # Candidate detail + transcript
│   ├── interview/[token]/   # Candidate-facing AI interview
│   └── api/                 # API routes
│       ├── auth/            # NextAuth + register
│       ├── jobs/            # CRUD jobs
│       ├── interviews/      # Interview engine (STT/TTS/complete)
│       ├── candidates/      # Candidate queries
│       └── invites/         # Email invite system
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── dashboard/           # Dashboard-specific components
│   └── interview/           # Voice interview client
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── auth.ts              # NextAuth config
│   ├── openai.ts            # OpenAI (LLM + STT + evaluation)
│   ├── email.ts             # Nodemailer email helpers
│   └── utils.ts             # Utilities
└── types/
    └── next-auth.d.ts       # Session type extensions
```

---

## Pricing

| Plan | Price | Interviews |
|------|-------|-----------|
| Starter | $99/mo | 100 |
| Growth | $299/mo | 500 |
| Enterprise | Custom | Unlimited |

---

## Deployment — Vercel + Railway

### Step 1 — Set up MySQL on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy MySQL**
2. Once provisioned, click the MySQL service → **Connect** tab
3. Copy the **MySQL URL** — it looks like:
   ```
   mysql://root:password@containers-us-west-xxx.railway.app:6541/railway
   ```

### Step 2 — Push the database schema

Point your local `.env` `DATABASE_URL` at Railway, then run:

```bash
npm run db:push
```

### Step 3 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

Or connect via the Vercel dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Vercel auto-detects Next.js — click **Deploy**

### Step 4 — Add environment variables in Vercel

In your Vercel project → **Settings** → **Environment Variables**, add all variables from `.env.example`:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Railway MySQL URL |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `OPENAI_API_KEY` | From platform.openai.com |
| `ELEVENLABS_API_KEY` | From elevenlabs.io |
| `ELEVENLABS_VOICE_ID` | Your chosen voice ID |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email address |
| `SMTP_PASS` | Your app password |
| `EMAIL_FROM` | `Zobo Jobs <noreply@yourdomain.com>` |
| `CRON_SECRET` | Run `openssl rand -base64 32` |

### Step 5 — Verify cron job

The reminder cron runs daily at 9am UTC (`vercel.json`). Vercel calls:
```
GET /api/cron/reminders
Authorization: Bearer <CRON_SECRET>
```

You can test it manually:
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
