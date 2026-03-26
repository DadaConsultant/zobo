"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Mic, CheckCircle, AlertCircle, Loader2, Square } from "lucide-react";

type Phase = "entry" | "permission" | "interview" | "complete" | "error";

interface TranscriptEntry {
  role: "ai" | "candidate";
  content: string;
  timestamp: number;
}

interface InterviewQuestion {
  id: string;
  text: string;
  type: string;
  followUpPrompt?: string;
}

interface InterviewScript {
  introduction: string;
  questions: InterviewQuestion[];
}

interface InterviewClientProps {
  token: string;
  jobTitle: string;
  company: string;
}

// ─── Visual sub-components ────────────────────────────────────────────────────

/** Floating particle field — values are deterministic to avoid hydration drift */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left: ((i * 37 + 11) % 97) + 1.5,
  top: ((i * 53 + 7) % 91) + 2,
  size: (i % 3) + 1,
  delay: (i * 0.4) % 5,
  duration: 4 + (i % 4),
  opacity: 0.08 + (i % 5) * 0.04,
}));

function ParticleField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyan-400 animate-pulse"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Low-poly wireframe AI face SVG */
function AiFace({ speaking, listening }: { speaking: boolean; listening: boolean }) {
  const active = speaking || listening;
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={speaking ? "4" : "2"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity={speaking ? "0.18" : "0.07"} />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background fill */}
      <ellipse cx="100" cy="108" rx="82" ry="95" fill="url(#faceGrad)" />

      {/* ── Outer face polygon ── */}
      <polygon
        points="100,12 148,35 168,78 162,128 138,172 100,185 62,172 38,128 32,78 52,35"
        stroke="#22d3ee"
        strokeWidth={speaking ? "1.8" : "1.2"}
        strokeOpacity={active ? "0.85" : "0.45"}
        filter="url(#glow)"
      />

      {/* ── Internal triangular mesh ── */}
      {/* Forehead diagonals */}
      <line x1="100" y1="12" x2="52" y2="78"   stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.35" : "0.15"} />
      <line x1="100" y1="12" x2="148" y2="78"  stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.35" : "0.15"} />
      <line x1="52"  y1="35" x2="148" y2="78"  stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.25" : "0.1"} />
      <line x1="148" y1="35" x2="52"  y2="78"  stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.25" : "0.1"} />
      {/* Cheek diagonals */}
      <line x1="32"  y1="78" x2="100" y2="128" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.25" : "0.1"} />
      <line x1="168" y1="78" x2="100" y2="128" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.25" : "0.1"} />
      <line x1="32"  y1="78" x2="168" y2="128" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <line x1="168" y1="78" x2="32"  y2="128" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      {/* Jaw diagonals */}
      <line x1="38"  y1="128" x2="100" y2="185" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.3" : "0.12"} />
      <line x1="162" y1="128" x2="100" y2="185" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.3" : "0.12"} />
      <line x1="38"  y1="128" x2="138" y2="172" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <line x1="162" y1="128" x2="62"  y2="172" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      {/* Center verticals */}
      <line x1="100" y1="12"  x2="100" y2="185" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.1" />
      <line x1="100" y1="78"  x2="38"  y2="128" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <line x1="100" y1="78"  x2="162" y2="128" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />

      {/* ── Eyes ── */}
      {/* Left eye */}
      <ellipse cx="72"  cy="90" rx="16" ry="9"
        stroke="#22d3ee" strokeWidth={speaking ? "1.8" : "1.3"}
        strokeOpacity={active ? "0.9" : "0.5"}
        filter="url(#glow)"
      />
      <ellipse cx="72"  cy="90" rx="5"  ry="5"
        fill="#22d3ee" fillOpacity={speaking ? "0.9" : "0.5"}
        filter="url(#glow)"
      />
      <line x1="56"  y1="90" x2="48"  y2="90" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="88"  y1="90" x2="96"  y2="90" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" />

      {/* Right eye */}
      <ellipse cx="128" cy="90" rx="16" ry="9"
        stroke="#22d3ee" strokeWidth={speaking ? "1.8" : "1.3"}
        strokeOpacity={active ? "0.9" : "0.5"}
        filter="url(#glow)"
      />
      <ellipse cx="128" cy="90" rx="5"  ry="5"
        fill="#22d3ee" fillOpacity={speaking ? "0.9" : "0.5"}
        filter="url(#glow)"
      />
      <line x1="112" y1="90" x2="104" y2="90" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="144" y1="90" x2="152" y2="90" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" />

      {/* ── Nose ── */}
      <path d="M100 104 L90 122 L110 122 Z"
        stroke="#22d3ee" strokeWidth="1" strokeOpacity={active ? "0.5" : "0.25"}
        fill="#22d3ee" fillOpacity={active ? "0.06" : "0.02"}
      />
      <line x1="100" y1="104" x2="100" y2="90" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity="0.2" />

      {/* ── Mouth ── */}
      <path
        d={speaking
          ? "M76 142 Q88 152 100 153 Q112 152 124 142"
          : "M76 142 Q100 150 124 142"}
        stroke="#22d3ee"
        strokeWidth={speaking ? "1.8" : "1.3"}
        strokeOpacity={active ? "0.85" : "0.4"}
        filter="url(#glow)"
      />
      <line x1="76"  y1="142" x2="62"  y2="128" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity="0.2" />
      <line x1="124" y1="142" x2="138" y2="128" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity="0.2" />

      {/* ── Vertex dots ── */}
      {[
        [100,12],[148,35],[168,78],[162,128],[138,172],[100,185],[62,172],[38,128],[32,78],[52,35],
        [72,90],[128,90],[100,122],[100,142]
      ].map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i < 10 ? "2.5" : "2"}
          fill="#22d3ee"
          fillOpacity={active ? (i < 4 ? "0.9" : "0.6") : "0.3"}
          filter="url(#glow)"
        />
      ))}
    </svg>
  );
}

/** Animated waveform bars */
function Waveform({
  active,
  color = "cyan",
  bars = 14,
}: {
  active: boolean;
  color?: "cyan" | "green";
  bars?: number;
}) {
  const HEIGHTS = [4, 7, 12, 18, 24, 30, 24, 28, 20, 15, 22, 18, 10, 6];
  const colorClass = color === "cyan" ? "bg-cyan-400" : "bg-emerald-400";

  return (
    <div className="flex items-center gap-[3px] h-10">
      {HEIGHTS.slice(0, bars).map((h, i) => (
        <div
          key={i}
          className={cn("rounded-full transition-all", colorClass, active ? "animate-bounce" : "")}
          style={{
            width: "3px",
            height: active ? `${h}px` : "3px",
            opacity: active ? 0.7 + (i % 3) * 0.1 : 0.2,
            animationDelay: `${i * 55}ms`,
            animationDuration: `${500 + (i % 4) * 120}ms`,
            transition: "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

/** Concentric pulse rings — appear when AI is speaking */
function PulseRings({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      <div className="absolute inset-[-12px] rounded-full border border-cyan-400/40 animate-ping"
        style={{ animationDuration: "1.4s" }} />
      <div className="absolute inset-[-28px] rounded-full border border-cyan-400/25 animate-ping"
        style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
      <div className="absolute inset-[-46px] rounded-full border border-cyan-400/12 animate-ping"
        style={{ animationDuration: "2.6s", animationDelay: "0.6s" }} />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InterviewClient({ token, jobTitle, company }: InterviewClientProps) {
  const [phase, setPhase] = useState<Phase>("entry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [interviewId, setInterviewId] = useState("");
  const [script, setScript] = useState<InterviewScript | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef  = useRef<Blob[]>([]);
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const startRecordingRef = useRef<() => void>(() => {});
  const processAudioRef   = useRef<() => Promise<void>>(async () => {});

  const currentQuestion = script?.questions[questionIndex];
  const totalQuestions  = script?.questions.length || 0;
  const progress = totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // ── Entry ──────────────────────────────────────────────────────────────────

  async function handleEntry(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Failed to start"); return; }

    setInterviewId(data.interviewId);
    setScript(data.interviewScript as InterviewScript);
    setPhase("permission");
  }

  async function requestMicPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPhase("interview");
    } catch {
      setError("Microphone access is required. Please allow microphone access and try again.");
    }
  }

  // ── TTS ────────────────────────────────────────────────────────────────────

  const speakText = useCallback(async (text: string) => {
    setAiSpeaking(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        setAiSpeaking(false);
        setTimeout(() => startRecordingRef.current(), 600);
        return;
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setAiSpeaking(false);
          URL.revokeObjectURL(url);
          setTimeout(() => startRecordingRef.current(), 600);
        };
        await audioRef.current.play();
      }
    } catch {
      setAiSpeaking(false);
      setTimeout(() => startRecordingRef.current(), 600);
    }
  }, [interviewId]);

  // ── Recording ──────────────────────────────────────────────────────────────

  function startRecording() {
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          await processAudioRef.current();
        };

        recorder.start();
        setIsRecording(true);
      })
      .catch(() => setError("Could not access microphone. Please check your permissions."));
  }

  function stopRecording() {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsThinking(true);
  }

  startRecordingRef.current = startRecording;

  // ── STT + AI response ──────────────────────────────────────────────────────

  async function processAudio() {
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    if (blob.size < 1000) {
      setIsThinking(false);
      setTimeout(() => startRecordingRef.current(), 300);
      return;
    }

    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    let candidateText = "";
    try {
      const res  = await fetch(`/api/interviews/${interviewId}/stt`, { method: "POST", body: formData });
      const data = await res.json();
      candidateText = data.transcript || "";
    } catch {
      candidateText = "[Audio could not be transcribed]";
    }

    if (!candidateText.trim()) {
      setIsThinking(false);
      setTimeout(() => startRecordingRef.current(), 300);
      return;
    }

    const candidateEntry: TranscriptEntry = { role: "candidate", content: candidateText, timestamp: Date.now() };
    const updatedTranscript = [...transcript, candidateEntry];
    setTranscript(updatedTranscript);

    if (!currentQuestion) return;
    const nextQuestion  = script?.questions[questionIndex + 1] || null;
    const shouldAdvance = followUpCount >= 1 ||
      updatedTranscript.filter((t) => t.role === "candidate").length > questionIndex + 1;

    let aiText = "";
    try {
      const res  = await fetch(`/api/interviews/${interviewId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: updatedTranscript, currentQuestion, nextQuestion: shouldAdvance ? nextQuestion : null }),
      });
      const data = await res.json();
      aiText = data.response || "";
    } catch {
      aiText = "Thank you for that answer. Let's continue.";
    }

    if (shouldAdvance && questionIndex >= totalQuestions - 1) {
      const aiEntry: TranscriptEntry = { role: "ai", content: aiText, timestamp: Date.now() };
      const finalTranscript = [...updatedTranscript, aiEntry];
      setTranscript(finalTranscript);
      setIsThinking(false);
      await speakText(aiText);
      await completeInterview(finalTranscript);
      return;
    }

    if (shouldAdvance) {
      setQuestionIndex((i) => i + 1);
      setFollowUpCount(0);
    } else {
      setFollowUpCount((c) => c + 1);
    }

    const aiEntry: TranscriptEntry = { role: "ai", content: aiText, timestamp: Date.now() };
    setTranscript((t) => [...t, aiEntry]);
    setIsThinking(false);
    await speakText(aiText);
  }

  processAudioRef.current = processAudio;

  // ── Complete ───────────────────────────────────────────────────────────────

  async function completeInterview(finalTranscript: TranscriptEntry[]) {
    await fetch(`/api/interviews/${interviewId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: finalTranscript }),
    });
    setPhase("complete");
  }

  useEffect(() => {
    if (phase === "interview" && script && transcript.length === 0) {
      const fullIntro = `${script.introduction} ${script.questions[0].text}`;
      setTranscript([{ role: "ai", content: fullIntro, timestamp: Date.now() }]);
      speakText(fullIntro);
    }
  }, [phase, script, transcript.length, speakText]);

  // ── Render: Entry ──────────────────────────────────────────────────────────

  if (phase === "entry") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
            <p className="text-gray-500 mt-1">{jobTitle}</p>
            <p className="text-sm text-gray-400">{company}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Let&apos;s get started</h2>
            <p className="text-sm text-gray-500 mb-6">
              This interview takes ~10–15 minutes. You&apos;ll need a microphone and a quiet environment.
            </p>
            <form onSubmit={handleEntry} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
              <Button type="submit" className="w-full" size="lg" loading={loading}>Continue</Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Permission ─────────────────────────────────────────────────────

  if (phase === "permission") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Microphone Access Required</h1>
          <p className="text-gray-500 mb-2">This AI interview uses your microphone to hear your responses.</p>
          <p className="text-sm text-gray-400 mb-8">Click below and allow microphone access when your browser asks.</p>
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <Button size="xl" onClick={requestMicPermission}>
            <Mic className="w-5 h-5" />
            Allow Microphone & Start Interview
          </Button>
          <div className="mt-8 bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-medium text-gray-700">Before you begin:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Find a quiet space</li>
              <li>✓ Use headphones if possible</li>
              <li>✓ Speak clearly and at a normal pace</li>
              <li>✓ Recording starts automatically after each question</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Complete ───────────────────────────────────────────────────────

  if (phase === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg,#020b18 0%,#041428 55%,#061935 100%)" }}>
        <ParticleField />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(16,185,129,0.15)", border: "1.5px solid rgba(16,185,129,0.4)" }}>
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Interview Complete!</h1>
          <p className="text-cyan-200/70 mb-2">Thank you, {name}! Your interview has been submitted.</p>
          <p className="text-sm text-cyan-400/50">The recruiter will review your results and be in touch if you&apos;re shortlisted.</p>
          <div className="mt-10 text-xs text-cyan-900/60">Powered by Zobo Jobs</div>
        </div>
      </div>
    );
  }

  // ── Render: Error ──────────────────────────────────────────────────────────

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // ── Render: Interview ──────────────────────────────────────────────────────

  // Derive state label
  const stateLabel = aiSpeaking
    ? "Interviewer is speaking"
    : isThinking
    ? "Processing your answer…"
    : isRecording
    ? "Your turn — speak now"
    : transcript.length > 0
    ? "Preparing microphone…"
    : "";

  const stateColor = aiSpeaking
    ? "text-cyan-400"
    : isThinking
    ? "text-indigo-400"
    : isRecording
    ? "text-emerald-400"
    : "text-cyan-700";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg,#020b18 0%,#041428 55%,#061935 100%)" }}
    >
      <audio ref={audioRef} className="hidden" />
      <ParticleField />

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 py-4 border-b border-cyan-900/30 backdrop-blur-sm"
        style={{ background: "rgba(2,11,24,0.7)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)" }}>
              <span className="text-cyan-400 font-bold text-sm">Z</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">{jobTitle}</p>
              <p className="text-cyan-400/50 text-xs mt-0.5">{company}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-cyan-400/60 text-xs mb-1.5">
              Question {Math.min(questionIndex + 1, totalQuestions)} / {totalQuestions}
            </p>
            <div className="w-28 h-1 rounded-full bg-cyan-900/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(34,211,238,0.6)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 py-8 max-w-2xl mx-auto w-full">

        {/* Avatar row: AI left · Candidate right */}
        <div className="w-full flex items-center justify-between mb-8">

          {/* ── AI side ── */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-cyan-400/70">
              Interviewer
            </p>
            {/* Orb container */}
            <div className="relative flex items-center justify-center">
              <PulseRings active={aiSpeaking} />
              <div
                className="relative w-36 h-36 rounded-full overflow-visible transition-all duration-500"
                style={{
                  boxShadow: aiSpeaking
                    ? "0 0 50px rgba(34,211,238,0.5), 0 0 100px rgba(34,211,238,0.2)"
                    : isRecording
                    ? "0 0 20px rgba(34,211,238,0.15)"
                    : "0 0 10px rgba(34,211,238,0.08)",
                }}
              >
                <AiFace speaking={aiSpeaking} listening={isRecording} />
              </div>
            </div>
            {/* AI waveform */}
            <Waveform active={aiSpeaking} color="cyan" bars={12} />
            {/* AI status badge */}
            <div
              className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-300"
              style={{
                background: aiSpeaking ? "rgba(34,211,238,0.15)" : "rgba(34,211,238,0.05)",
                border: `1px solid ${aiSpeaking ? "rgba(34,211,238,0.4)" : "rgba(34,211,238,0.15)"}`,
                color: aiSpeaking ? "#22d3ee" : "rgba(34,211,238,0.4)",
              }}
            >
              {aiSpeaking ? "● Speaking" : isRecording ? "● Listening" : "● Waiting"}
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="flex flex-col items-center gap-1 px-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-px h-3 rounded-full bg-cyan-800/40" />
            ))}
          </div>

          {/* ── Candidate side ── */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400/70">
              You
            </p>
            {/* Candidate avatar orb */}
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <div className="absolute inset-[-12px] rounded-full border border-emerald-400/40 animate-ping"
                    style={{ animationDuration: "1.4s" }} />
                  <div className="absolute inset-[-28px] rounded-full border border-emerald-400/20 animate-ping"
                    style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
                </>
              )}
              <div
                className="w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: isRecording
                    ? "radial-gradient(circle,rgba(16,185,129,0.2) 0%,rgba(16,185,129,0.05) 70%,transparent 100%)"
                    : "radial-gradient(circle,rgba(34,211,238,0.06) 0%,transparent 70%)",
                  border: isRecording
                    ? "1.5px solid rgba(16,185,129,0.5)"
                    : "1.5px solid rgba(34,211,238,0.15)",
                  boxShadow: isRecording
                    ? "0 0 40px rgba(16,185,129,0.35), 0 0 80px rgba(16,185,129,0.1)"
                    : "0 0 10px rgba(34,211,238,0.05)",
                }}
              >
                {isRecording ? (
                  <div className="flex flex-col items-center gap-1">
                    <Mic className="w-10 h-10 text-emerald-400" />
                    <span className="text-emerald-400/80 text-xs animate-pulse">Recording</span>
                  </div>
                ) : (
                  <span
                    className="text-4xl font-bold"
                    style={{ color: "rgba(34,211,238,0.4)" }}
                  >
                    {name[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
            </div>
            {/* Candidate waveform */}
            <Waveform active={isRecording} color="green" bars={12} />
            {/* Candidate status badge */}
            <div
              className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-300"
              style={{
                background: isRecording ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.05)",
                border: `1px solid ${isRecording ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.15)"}`,
                color: isRecording ? "#34d399" : "rgba(52,211,153,0.35)",
              }}
            >
              {isRecording ? "● Speaking" : aiSpeaking ? "● Listening" : "● Waiting"}
            </div>
          </div>
        </div>

        {/* ── Global state label ── */}
        <div className="w-full flex items-center justify-center gap-2 mb-6 h-8">
          {isThinking && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
          <span className={cn("text-sm font-semibold tracking-wide transition-all duration-300", stateColor)}>
            {stateLabel}
          </span>
        </div>

        {/* ── Transcript ── */}
        <div className="w-full flex-1 overflow-y-auto space-y-3 pb-4"
          style={{ maxHeight: "260px" }}>
          {transcript.map((entry, i) => (
            <div key={i} className={cn("flex gap-2.5", entry.role === "candidate" ? "flex-row-reverse" : "flex-row")}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={
                  entry.role === "ai"
                    ? { background: "rgba(34,211,238,0.2)", border: "1px solid rgba(34,211,238,0.4)", color: "#22d3ee" }
                    : { background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399" }
                }
              >
                {entry.role === "ai" ? "Z" : name[0]?.toUpperCase()}
              </div>
              <div
                className="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  entry.role === "ai"
                    ? { background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.15)", color: "rgba(207,250,254,0.9)" }
                    : { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "rgba(167,243,208,0.9)" }
                }
              >
                {entry.content}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "rgba(34,211,238,0.2)", border: "1px solid rgba(34,211,238,0.4)", color: "#22d3ee" }}>
                Z
              </div>
              <div className="px-4 py-2.5 rounded-2xl flex items-center gap-2"
                style={{ background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.15)" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* ── Stop button (only when recording) ── */}
        {isRecording && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: "rgba(239,68,68,0.2)",
                border: "2px solid rgba(239,68,68,0.6)",
                boxShadow: "0 0 30px rgba(239,68,68,0.3)",
              }}
            >
              <Square className="w-6 h-6 fill-red-400 text-red-400" />
            </button>
            <span className="text-xs text-red-400/70">Tap to finish your answer</span>
          </div>
        )}

        {/* Hint when AI is speaking */}
        {aiSpeaking && (
          <p className="mt-4 text-xs text-cyan-800/60 text-center">
            Microphone will activate automatically when the interviewer finishes
          </p>
        )}
      </div>
    </div>
  );
}
