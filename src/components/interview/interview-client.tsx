"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { MutableRefObject } from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Mic, CheckCircle, AlertCircle, Loader2, Square, Video, VideoOff, RefreshCw, Upload } from "lucide-react";

type Phase = "entry" | "permission" | "interview" | "uploading" | "complete" | "error";
type PermissionState = "idle" | "requesting" | "granted" | "denied";

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
      <ellipse cx="100" cy="108" rx="82" ry="95" fill="url(#faceGrad)" />
      <polygon
        points="100,12 148,35 168,78 162,128 138,172 100,185 62,172 38,128 32,78 52,35"
        stroke="#22d3ee"
        strokeWidth={speaking ? "1.8" : "1.2"}
        strokeOpacity={active ? "0.85" : "0.45"}
        filter="url(#glow)"
      />
      <line x1="100" y1="12" x2="52" y2="78"   stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.35" : "0.15"} />
      <line x1="100" y1="12" x2="148" y2="78"  stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.35" : "0.15"} />
      <line x1="52"  y1="35" x2="148" y2="78"  stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.25" : "0.1"} />
      <line x1="148" y1="35" x2="52"  y2="78"  stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.25" : "0.1"} />
      <line x1="32"  y1="78" x2="100" y2="128" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.25" : "0.1"} />
      <line x1="168" y1="78" x2="100" y2="128" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.25" : "0.1"} />
      <line x1="32"  y1="78" x2="168" y2="128" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <line x1="168" y1="78" x2="32"  y2="128" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <line x1="38"  y1="128" x2="100" y2="185" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.3" : "0.12"} />
      <line x1="162" y1="128" x2="100" y2="185" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity={active ? "0.3" : "0.12"} />
      <line x1="38"  y1="128" x2="138" y2="172" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <line x1="162" y1="128" x2="62"  y2="172" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <line x1="100" y1="12"  x2="100" y2="185" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.1" />
      <line x1="100" y1="78"  x2="38"  y2="128" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <line x1="100" y1="78"  x2="162" y2="128" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
      <ellipse cx="72"  cy="90" rx="16" ry="9" stroke="#22d3ee" strokeWidth={speaking ? "1.8" : "1.3"} strokeOpacity={active ? "0.9" : "0.5"} filter="url(#glow)" />
      <ellipse cx="72"  cy="90" rx="5"  ry="5"  fill="#22d3ee" fillOpacity={speaking ? "0.9" : "0.5"} filter="url(#glow)" />
      <line x1="56"  y1="90" x2="48"  y2="90" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="88"  y1="90" x2="96"  y2="90" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" />
      <ellipse cx="128" cy="90" rx="16" ry="9" stroke="#22d3ee" strokeWidth={speaking ? "1.8" : "1.3"} strokeOpacity={active ? "0.9" : "0.5"} filter="url(#glow)" />
      <ellipse cx="128" cy="90" rx="5"  ry="5"  fill="#22d3ee" fillOpacity={speaking ? "0.9" : "0.5"} filter="url(#glow)" />
      <line x1="112" y1="90" x2="104" y2="90" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="144" y1="90" x2="152" y2="90" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" />
      <path d="M100 104 L90 122 L110 122 Z" stroke="#22d3ee" strokeWidth="1" strokeOpacity={active ? "0.5" : "0.25"} fill="#22d3ee" fillOpacity={active ? "0.06" : "0.02"} />
      <line x1="100" y1="104" x2="100" y2="90" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity="0.2" />
      <path
        d={speaking ? "M76 142 Q88 152 100 153 Q112 152 124 142" : "M76 142 Q100 150 124 142"}
        stroke="#22d3ee" strokeWidth={speaking ? "1.8" : "1.3"} strokeOpacity={active ? "0.85" : "0.4"} filter="url(#glow)"
      />
      <line x1="76"  y1="142" x2="62"  y2="128" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity="0.2" />
      <line x1="124" y1="142" x2="138" y2="128" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity="0.2" />
      {[
        [100,12],[148,35],[168,78],[162,128],[138,172],[100,185],[62,172],[38,128],[32,78],[52,35],
        [72,90],[128,90],[100,122],[100,142],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i < 10 ? "2.5" : "2"}
          fill="#22d3ee" fillOpacity={active ? (i < 4 ? "0.9" : "0.6") : "0.3"} filter="url(#glow)"
        />
      ))}
    </svg>
  );
}

function Waveform({ active, color = "cyan", bars = 14 }: { active: boolean; color?: "cyan" | "green"; bars?: number }) {
  const HEIGHTS = [4, 7, 12, 18, 24, 30, 24, 28, 20, 15, 22, 18, 10, 6];
  const colorClass = color === "cyan" ? "bg-cyan-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-[3px] h-10">
      {HEIGHTS.slice(0, bars).map((h, i) => (
        <div key={i} className={cn("rounded-full transition-all", colorClass, active ? "animate-bounce" : "")}
          style={{ width: "3px", height: active ? `${h}px` : "3px", opacity: active ? 0.7 + (i % 3) * 0.1 : 0.2,
            animationDelay: `${i * 55}ms`, animationDuration: `${500 + (i % 4) * 120}ms`, transition: "height 0.3s ease" }} />
      ))}
    </div>
  );
}

function PulseRings({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      <div className="absolute inset-[-12px] rounded-full border border-cyan-400/40 animate-ping" style={{ animationDuration: "1.4s" }} />
      <div className="absolute inset-[-28px] rounded-full border border-cyan-400/25 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
      <div className="absolute inset-[-46px] rounded-full border border-cyan-400/12 animate-ping" style={{ animationDuration: "2.6s", animationDelay: "0.6s" }} />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function getVideoMimeType(): string {
  const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return types.find((t) => {
    try { return MediaRecorder.isTypeSupported(t); } catch { return false; }
  }) ?? "";
}

function getAudioMimeType(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm"];
  return types.find((t) => {
    try { return MediaRecorder.isTypeSupported(t); } catch { return false; }
  }) ?? "";
}

/**
 * Full-session recording: one stream with camera video + mixed audio (mic + AI TTS from <audio>).
 * Per-answer STT must keep using the raw camera mic stream, not this mix.
 */
function buildFullSessionRecordingStream(
  cameraStream: MediaStream,
  aiAudioEl: HTMLAudioElement,
  ctxRef: MutableRefObject<AudioContext | null>,
  composedRef: MutableRefObject<MediaStream | null>
): MediaStream {
  if (composedRef.current) return composedRef.current;

  const videoTrack = cameraStream.getVideoTracks()[0];
  const micTracks = cameraStream.getAudioTracks();
  if (!videoTrack || micTracks.length === 0) return cameraStream;

  const AC =
    typeof window !== "undefined"
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!AC) return cameraStream;

  try {
    const ctx = new AC();
    ctxRef.current = ctx;
    void ctx.resume();

    const destination = ctx.createMediaStreamDestination();
    const micSrc = ctx.createMediaStreamSource(new MediaStream(micTracks));
    const micGain = ctx.createGain();
    micGain.gain.value = 1;
    micSrc.connect(micGain);
    // Record mic only — do not connect mic to ctx.destination or the candidate hears
    // themselves delayed (echo) through the speakers.
    micGain.connect(destination);

    const elSrc = ctx.createMediaElementSource(aiAudioEl);
    const aiGain = ctx.createGain();
    aiGain.gain.value = 1;
    elSrc.connect(aiGain);
    aiGain.connect(destination);
    aiGain.connect(ctx.destination);

    const mixedAudio = destination.stream.getAudioTracks()[0];
    if (!mixedAudio) {
      ctx.close();
      ctxRef.current = null;
      return cameraStream;
    }

    const out = new MediaStream([videoTrack, mixedAudio]);
    composedRef.current = out;
    return out;
  } catch (err) {
    console.warn("[interview] Full-session audio mix unavailable, using microphone only:", err);
    return cameraStream;
  }
}

function disposeFullSessionRecordingAudio(ctxRef: MutableRefObject<AudioContext | null>) {
  try {
    ctxRef.current?.close();
  } catch {
    /* ignore */
  }
  ctxRef.current = null;
}

const interviewGateStorageKey = (linkToken: string) => `zobo_interview_gate_${linkToken}`;

function displayNameFromVerify(apiName: unknown, candidateEmail: string): string {
  if (typeof apiName === "string" && apiName.trim()) return apiName.trim();
  const local = candidateEmail.split("@")[0]?.trim();
  return local || "Candidate";
}

export default function InterviewClient({ token, jobTitle, company }: InterviewClientProps) {
  const [phase, setPhase] = useState<Phase>("entry");
  /** 1 = enter email, 2 = verified — continue to camera */
  const [entryStep, setEntryStep] = useState<1 | 2>(1);
  const [sessionRestoreDone, setSessionRestoreDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");

  const [interviewId, setInterviewId] = useState("");
  const [script, setScript] = useState<InterviewScript | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [cameraTrackEnded, setCameraTrackEnded] = useState(false);
  const [preparingCountdown, setPreparingCountdown] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Audio-only per-answer recorder
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const audioChunksRef    = useRef<Blob[]>([]);
  // Full-interview video recorder
  const videoStreamRef    = useRef<MediaStream | null>(null);
  const videoRecorderRef  = useRef<MediaRecorder | null>(null);
  const videoChunksRef    = useRef<Blob[]>([]);
  /** Web Audio graph for mic + TTS → full-session MediaRecorder */
  const recordingAudioContextRef = useRef<AudioContext | null>(null);
  const recordingComposedStreamRef = useRef<MediaStream | null>(null);
  // Playback
  const audioRef          = useRef<HTMLAudioElement | null>(null);
  // Helpers
  const transcriptEndRef  = useRef<HTMLDivElement>(null);
  const startRecordingRef = useRef<() => void>(() => {});
  const processAudioRef   = useRef<() => Promise<void>>(async () => {});
  const isClosingRef      = useRef(false);
  const discardAudioRef   = useRef(false);
  const lastAiMessageRef  = useRef("");
  const introAudioUrlRef  = useRef<string | null>(null);

  const currentQuestion = script?.questions[questionIndex];
  const totalQuestions  = script?.questions.length ?? 0;
  const progress        = totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // ── Network detection ──────────────────────────────────────────────────────

  useEffect(() => {
    const onOnline  = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Restore verified email from this browser session (same tab / refresh)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(interviewGateStorageKey(token));
      if (!raw) {
        setSessionRestoreDone(true);
        return;
      }
      const parsed = JSON.parse(raw) as { email?: string };
      const storedEmail = parsed?.email?.trim();
      if (!storedEmail) {
        setSessionRestoreDone(true);
        return;
      }
      setEmail(storedEmail);
      void (async () => {
        try {
          const res = await fetch("/api/interviews/verify-candidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, email: storedEmail }),
          });
          const data = await res.json();
          if (res.ok && data.verified) {
            setName(displayNameFromVerify(data.name, storedEmail));
            setEntryStep(2);
          } else {
            sessionStorage.removeItem(interviewGateStorageKey(token));
          }
        } catch {
          sessionStorage.removeItem(interviewGateStorageKey(token));
        } finally {
          setSessionRestoreDone(true);
        }
      })();
    } catch {
      setSessionRestoreDone(true);
    }
  }, [token]);

  // ── Leave-page protection ──────────────────────────────────────────────────
  // Active during two phases:
  //   "interview" — block + fire abandon beacon so the server saves partial data
  //   "uploading" — block only, to prevent the video upload being cut off
  //
  // e.preventDefault() + e.returnValue = "" triggers the browser's native
  // "Leave site? Changes you made may not be saved." dialog in all modern
  // browsers. Custom messages are ignored by browsers for security reasons.

  useEffect(() => {
    const shouldBlock = phase === "interview" || phase === "uploading";
    if (!shouldBlock) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show the browser's native leave-site warning
      e.preventDefault();
      e.returnValue = "";

      // During the interview, also beacon the server to save partial data
      if (phase === "interview" && interviewId) {
        navigator.sendBeacon(
          `/api/interviews/${interviewId}/abandon`,
          new Blob([JSON.stringify({ transcript })], { type: "application/json" })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase, interviewId, transcript]);

  // ── Entry ──────────────────────────────────────────────────────────────────

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/interviews/verify-candidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email: email.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Verification failed");
      return;
    }

    setName(displayNameFromVerify(data.name, email.trim()));
    try {
      sessionStorage.setItem(
        interviewGateStorageKey(token),
        JSON.stringify({ email: email.trim().toLowerCase() })
      );
    } catch {
      // private mode / quota — continue without persistence
    }
    setEntryStep(2);
  }

  async function handleStartAfterVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email: email.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Failed to start");
      return;
    }

    if (typeof data.name === "string" && data.name) setName(data.name);
    setInterviewId(data.interviewId);
    setScript(data.interviewScript as InterviewScript);
    setPhase("permission");
  }

  // ── Camera + mic permission ────────────────────────────────────────────────

  const requestCameraPermission = useCallback(async () => {
    setPermissionState("requesting");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      videoStreamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onmute  = () => { setIsCameraOff(true);  setCameraTrackEnded(false); };
        videoTrack.onunmute = () => { setIsCameraOff(false); setCameraTrackEnded(false); };
        videoTrack.onended  = () => { setIsCameraOff(true);  setCameraTrackEnded(true);  };
      }

      setPermissionState("granted");
    } catch {
      setPermissionState("denied");
      setError("Camera and microphone access is required for this video interview. Please allow access and try again.");
    }
  }, []);

  // Auto-request when entering permission phase
  useEffect(() => {
    if (phase === "permission" && permissionState === "idle") {
      requestCameraPermission();
    }
  }, [phase, permissionState, requestCameraPermission]);

  // Callback ref: binds the live stream to whichever <video> element mounts
  const bindVideoStream = useCallback((el: HTMLVideoElement | null) => {
    if (el && videoStreamRef.current) {
      el.srcObject = videoStreamRef.current;
    }
  }, []);

  // ── Camera-off enforcement ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isCameraOff) return;

    // Stop AI audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setAiSpeaking(false);

    // Discard any in-progress answer recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      discardAudioRef.current = true;
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsThinking(false);

    // Pause the full interview video recorder
    if (videoRecorderRef.current && videoRecorderRef.current.state === "recording") {
      videoRecorderRef.current.pause();
    }
  }, [isCameraOff]);

  // When camera comes back, resume recording and re-prompt the candidate
  useEffect(() => {
    if (isCameraOff || phase !== "interview" || transcript.length === 0) return;

    // Resume the full interview video recorder
    if (videoRecorderRef.current && videoRecorderRef.current.state === "paused") {
      videoRecorderRef.current.resume();
    }

    // Re-speak the last AI message so the candidate knows where they are
    if (lastAiMessageRef.current && !isClosingRef.current) {
      setTimeout(() => speakText(lastAiMessageRef.current), 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOff]);

  // ── TTS ────────────────────────────────────────────────────────────────────

  const speakText = useCallback((text: string, preloadedUrl?: string): Promise<void> => {
    lastAiMessageRef.current = text;
    setAiSpeaking(true);

    return new Promise(async (resolve) => {
      try {
        let url: string;

        if (preloadedUrl) {
          url = preloadedUrl;
        } else {
          const res = await fetch(`/api/interviews/${interviewId}/tts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });

          if (!res.ok) {
            setAiSpeaking(false);
            if (!isClosingRef.current && !isCameraOff) setTimeout(() => startRecordingRef.current(), 600);
            resolve();
            return;
          }

          const blob = await res.blob();
          url = URL.createObjectURL(blob);
        }

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.onended = () => {
            setAiSpeaking(false);
            URL.revokeObjectURL(url);
            if (!isClosingRef.current && !isCameraOff) setTimeout(() => startRecordingRef.current(), 600);
            resolve();
          };
          await audioRef.current.play().catch(() => {
            setAiSpeaking(false);
            resolve();
          });
        } else {
          resolve();
        }
      } catch {
        setAiSpeaking(false);
        if (!isClosingRef.current && !isCameraOff) setTimeout(() => startRecordingRef.current(), 600);
        resolve();
      }
    });
  // isCameraOff intentionally excluded — checked via ref pattern inside
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // ── Per-answer audio recording (uses audio track from video stream) ─────────

  function startRecording() {
    if (!videoStreamRef.current || isCameraOff) return;

    const audioTracks = videoStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) return;

    audioChunksRef.current = [];
    discardAudioRef.current = false;

    const audioStream = new MediaStream(audioTracks);
    const mimeType    = getAudioMimeType();
    const recorder    = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      if (!discardAudioRef.current) {
        await processAudioRef.current();
      }
      discardAudioRef.current = false;
    };

    recorder.start();
    setIsRecording(true);
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
      if (!isCameraOff) setTimeout(() => startRecordingRef.current(), 300);
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
      if (!isCameraOff) setTimeout(() => startRecordingRef.current(), 300);
      return;
    }

    const candidateEntry: TranscriptEntry = { role: "candidate", content: candidateText, timestamp: Date.now() };
    const updatedTranscript = [...transcript, candidateEntry];
    setTranscript(updatedTranscript);

    if (!currentQuestion) return;
    const nextQuestion  = script?.questions[questionIndex + 1] ?? null;
    // Advance after exactly 1 follow-up per question.
    // totalQuestions is driven by script.questions.length — whatever GPT generated.
    const shouldAdvance = followUpCount >= 1;

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
      isClosingRef.current = true;
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

  // ── Complete + video upload ────────────────────────────────────────────────

  async function completeInterview(finalTranscript: TranscriptEntry[]) {
    setPhase("uploading");

    // Stop the continuous video recorder and collect remaining chunks
    const videoBlob = await new Promise<Blob>((resolve) => {
      const recorder = videoRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(new Blob(videoChunksRef.current, { type: "video/webm" }));
        return;
      }
      if (recorder.state === "paused") recorder.resume();
      recorder.addEventListener("stop", () => {
        resolve(new Blob(videoChunksRef.current, { type: "video/webm" }));
      }, { once: true });
      recorder.stop();
    });

    // Upload video directly to Vercel Blob CDN (bypasses the 4.5 MB serverless limit)
    if (videoBlob.size > 10_000) {
      try {
        const blob = await upload(
          `interviews/${interviewId}/recording.webm`,
          videoBlob,
          {
            access: "public",
            handleUploadUrl: `/api/interviews/${interviewId}/upload-video`,
          }
        );
        // Save URL explicitly — guarantees it persists in local dev
        // (where the Vercel CDN callback cannot reach localhost)
        await fetch(`/api/interviews/${interviewId}/upload-video`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: blob.url }),
        });
      } catch (err) {
        console.error("Video upload failed — transcript will still be saved:", err);
      }
    }

    // Save transcript + AI evaluation
    await fetch(`/api/interviews/${interviewId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: finalTranscript }),
    });

    // Release camera + mic + recording mix graph
    disposeFullSessionRecordingAudio(recordingAudioContextRef);
    recordingComposedStreamRef.current = null;
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());

    setPhase("complete");
  }

  // ── Start interview: countdown + pre-fetch audio ──────────────────────────

  useEffect(() => {
    if (phase !== "interview" || !script || transcript.length !== 0) return;

    // Start continuous video recorder (video + mixed mic + AI TTS for employers)
    const startRecorder = () => {
      if (!videoStreamRef.current) return;
      const cam = videoStreamRef.current;
      const el = audioRef.current;
      const streamForRecorder =
        el != null
          ? buildFullSessionRecordingStream(
              cam,
              el,
              recordingAudioContextRef,
              recordingComposedStreamRef
            )
          : cam;

      const mimeType = getVideoMimeType();
      const recorder = new MediaRecorder(
        streamForRecorder,
        mimeType ? { mimeType } : undefined
      );
      videoRecorderRef.current = recorder;
      videoChunksRef.current   = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };
      recorder.start(1000);
    };

    // Wait a frame so <audio ref={audioRef}> is attached before createMediaElementSource
    let cancelled = false;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!cancelled) startRecorder();
      });
    });

    const fullIntro = `${script.introduction} ${script.questions[0].text}`;
    introAudioUrlRef.current = null;

    // Pre-fetch the intro audio in the background during the countdown
    // so it's ready to play the instant the countdown ends
    fetch(`/api/interviews/${interviewId}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: fullIntro }),
    })
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (blob) introAudioUrlRef.current = URL.createObjectURL(blob);
      })
      .catch(() => {});

    // 3-second countdown — gives the candidate time to prepare and
    // lets the pre-fetch complete so audio plays immediately after
    let count = 3;
    setPreparingCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setPreparingCountdown(null);
        setTranscript([{ role: "ai", content: fullIntro, timestamp: Date.now() }]);
        // Play pre-fetched audio if ready, otherwise speakText fetches it
        speakText(fullIntro, introAudioUrlRef.current ?? undefined);
      } else {
        setPreparingCountdown(count);
      }
    }, 1000);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearInterval(interval);
    };
  }, [phase, script, transcript.length, speakText, interviewId]);

  // ── Render: Entry ──────────────────────────────────────────────────────────

  if (phase === "entry") {
    if (!sessionRestoreDone) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading…</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Video Interview</h1>
            <p className="text-gray-500 mt-1">{jobTitle}</p>
            <p className="text-sm text-gray-400">{company}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {entryStep === 1 ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Confirm your invite</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Enter the <strong>same email address</strong> the company used to invite you. Only registered candidates can start this interview.
                </p>
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Continue
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">You&apos;re all set</h2>
                <p className="text-sm text-gray-500 mb-4">
                  This interview takes ~10–15 minutes and is fully recorded. You&apos;ll need a camera and microphone.
                </p>
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 mb-6">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Interviewing as</p>
                  <p className="text-base font-semibold text-gray-900">{name}</p>
                  <p className="text-sm text-gray-500 mt-1">{email}</p>
                </div>
                <form onSubmit={handleStartAfterVerify} className="space-y-4">
                  {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Start interview setup
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntryStep(1);
                      setError("");
                      try {
                        sessionStorage.removeItem(interviewGateStorageKey(token));
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Use a different email
                  </button>
                </form>
              </>
            )}
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
          {permissionState === "requesting" && (
            <>
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Setting up your camera…</h1>
              <p className="text-gray-500">Please allow camera and microphone access when your browser asks.</p>
            </>
          )}

          {permissionState === "denied" && (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <VideoOff className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Camera Access Denied</h1>
              <p className="text-red-500 text-sm mb-6">{error}</p>
              <Button onClick={requestCameraPermission} size="lg">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </>
          )}

          {permissionState === "granted" && (
            <>
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Camera Ready</h1>
              <p className="text-gray-500 text-sm mb-5">Make sure you&apos;re well-lit and your face is clearly visible.</p>

              {/* Live camera preview */}
              <div className="relative mx-auto mb-6 rounded-2xl overflow-hidden bg-black"
                style={{ width: 280, height: 210 }}>
                <video ref={bindVideoStream} autoPlay muted playsInline
                  className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 rounded-full px-2 py-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-medium">Live</span>
                </div>
              </div>

              <Button size="xl" onClick={() => setPhase("interview")} className="w-full max-w-xs mx-auto">
                <Video className="w-5 h-5" />
                Start Video Interview
              </Button>

              <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Before you begin:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>✓ Find a quiet, well-lit space</li>
                  <li>✓ Keep your camera on for the entire interview</li>
                  <li>✓ Speak clearly and at a normal pace</li>
                  <li>✓ The full session will be recorded</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Uploading ──────────────────────────────────────────────────────

  if (phase === "uploading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg,#020b18 0%,#041428 55%,#061935 100%)" }}>
        <ParticleField />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34,211,238,0.1)", border: "1.5px solid rgba(34,211,238,0.3)" }}>
            <Upload className="w-9 h-9 text-cyan-400 animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Saving Your Interview</h1>
          <p className="text-cyan-200/70 mb-2">Uploading your video recording…</p>
          <p className="text-sm text-cyan-400/50">This may take a moment. Please keep this page open.</p>
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce"
                style={{ animationDelay: `${i * 200}ms` }} />
            ))}
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

  const stateLabel = isCameraOff
    ? "Camera is off — interview paused"
    : aiSpeaking
    ? "Interviewer is speaking"
    : isThinking
    ? "Processing your answer…"
    : isRecording
    ? "Your turn — speak now"
    : transcript.length > 0
    ? "Preparing microphone…"
    : "";

  const stateColor = isCameraOff
    ? "text-red-400"
    : aiSpeaking
    ? "text-cyan-400"
    : isThinking
    ? "text-indigo-400"
    : isRecording
    ? "text-emerald-400"
    : "text-cyan-700";

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg,#020b18 0%,#041428 55%,#061935 100%)" }}>
      <audio ref={audioRef} className="hidden" playsInline />
      <ParticleField />

      {/* ── Interview start countdown overlay ────────────────────────────── */}
      {preparingCountdown !== null && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center"
          style={{ background: "rgba(2,5,12,0.96)", backdropFilter: "blur(10px)" }}>

          {/* Job context */}
          <p className="text-cyan-400/50 text-xs font-semibold tracking-widest uppercase mb-10">
            {company} · {jobTitle}
          </p>

          {/* Countdown ring + number */}
          <div className="relative flex items-center justify-center mb-10">
            <svg className="absolute" width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="4" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(34,211,238,0.6)"
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * (3 - preparingCountdown) / 3)}
                transform="rotate(-90 80 80)"
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            </svg>
            <span className="text-8xl font-black tabular-nums"
              style={{ color: "#fff", textShadow: "0 0 40px rgba(34,211,238,0.7)" }}>
              {preparingCountdown}
            </span>
          </div>

          {/* Message */}
          <h2 className="text-white text-2xl font-bold mb-2">Get Ready</h2>
          <p className="text-cyan-300/60 text-sm text-center max-w-xs">
            Your AI interviewer is about to start.<br />Find a comfortable position and speak clearly.
          </p>

          {/* Animated dots to show loading in background */}
          <div className="flex items-center gap-1.5 mt-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse"
                style={{ animationDelay: `${i * 300}ms` }} />
            ))}
            <span className="text-cyan-400/40 text-xs ml-2">Preparing your interview…</span>
          </div>
        </div>
      )}

      {/* ── Camera-off blocking overlay ──────────────────────────────────── */}
      {isCameraOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(2,5,12,0.92)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm text-center px-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.4)" }}>
              <VideoOff className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Camera Turned Off</h2>
            <p className="text-red-300/80 text-sm mb-6">
              Video recording is required for this interview. Please turn your camera back on to continue.
            </p>
            {cameraTrackEnded ? (
              <>
                <p className="text-xs text-red-400/60 mb-4">
                  Your camera access was revoked. Click below to re-enable it.
                </p>
                <Button onClick={requestCameraPermission} className="bg-red-600 hover:bg-red-700 text-white">
                  <RefreshCw className="w-4 h-4" />
                  Grant Camera Access
                </Button>
              </>
            ) : (
              <p className="text-xs text-cyan-400/50">
                The interview will resume automatically once your camera is back on.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Offline banner ───────────────────────────────────────────────── */}
      {isOffline && (
        <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 py-2.5 text-sm font-medium"
          style={{ background: "rgba(239,68,68,0.95)", backdropFilter: "blur(4px)" }}>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white">Connection lost — your progress is saved. Reconnecting…</span>
        </div>
      )}

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
          <div className="flex items-center gap-4">
            {/* Recording indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400/80 text-xs font-medium">REC</span>
            </div>
            <div className="text-right">
              <p className="text-cyan-400/60 text-xs mb-1.5">
                Question {Math.min(questionIndex + 1, totalQuestions)} / {totalQuestions}
              </p>
              <div className="w-28 h-1 rounded-full bg-cyan-900/40 overflow-hidden">
                <div className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                  style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(34,211,238,0.6)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 py-8 max-w-2xl mx-auto w-full">

        {/* Avatar row */}
        <div className="w-full flex items-center justify-between mb-8">

          {/* AI side */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-cyan-400/70">Interviewer</p>
            <div className="relative flex items-center justify-center">
              <PulseRings active={aiSpeaking} />
              <div className="relative w-36 h-36 rounded-full overflow-visible transition-all duration-500"
                style={{ boxShadow: aiSpeaking
                  ? "0 0 50px rgba(34,211,238,0.5), 0 0 100px rgba(34,211,238,0.2)"
                  : isRecording ? "0 0 20px rgba(34,211,238,0.15)" : "0 0 10px rgba(34,211,238,0.08)" }}>
                <AiFace speaking={aiSpeaking} listening={isRecording} />
              </div>
            </div>
            <Waveform active={aiSpeaking} color="cyan" bars={12} />
            <div className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-300"
              style={{ background: aiSpeaking ? "rgba(34,211,238,0.15)" : "rgba(34,211,238,0.05)",
                border: `1px solid ${aiSpeaking ? "rgba(34,211,238,0.4)" : "rgba(34,211,238,0.15)"}`,
                color: aiSpeaking ? "#22d3ee" : "rgba(34,211,238,0.4)" }}>
              {aiSpeaking ? "● Speaking" : isRecording ? "● Listening" : "● Waiting"}
            </div>
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center gap-1 px-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-px h-3 rounded-full bg-cyan-800/40" />
            ))}
          </div>

          {/* Candidate side — live camera feed */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400/70">You</p>
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <div className="absolute inset-[-12px] rounded-full border border-emerald-400/40 animate-ping" style={{ animationDuration: "1.4s" }} />
                  <div className="absolute inset-[-28px] rounded-full border border-emerald-400/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
                </>
              )}
              <div className="w-36 h-36 rounded-full overflow-hidden transition-all duration-500"
                style={{ border: isRecording ? "2px solid rgba(16,185,129,0.6)" : "1.5px solid rgba(34,211,238,0.2)",
                  boxShadow: isRecording ? "0 0 40px rgba(16,185,129,0.35), 0 0 80px rgba(16,185,129,0.1)" : "0 0 10px rgba(34,211,238,0.05)" }}>
                <video ref={bindVideoStream} autoPlay muted playsInline
                  className="w-full h-full object-cover scale-x-[-1]" />
              </div>
              {isRecording && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-900/80 rounded-full px-2 py-0.5">
                  <Mic className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px] font-medium">Recording</span>
                </div>
              )}
            </div>
            <Waveform active={isRecording} color="green" bars={12} />
            <div className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-300"
              style={{ background: isRecording ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.05)",
                border: `1px solid ${isRecording ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.15)"}`,
                color: isRecording ? "#34d399" : "rgba(52,211,153,0.35)" }}>
              {isRecording ? "● Speaking" : aiSpeaking ? "● Listening" : "● Waiting"}
            </div>
          </div>
        </div>

        {/* Global state label */}
        <div
          className={cn(
            "w-full flex flex-col items-center justify-center gap-1 mb-6",
            isRecording ? "min-h-[3.25rem]" : "h-8 flex-row gap-2"
          )}
        >
          {isThinking && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
          <span className={cn("text-sm font-semibold tracking-wide transition-all duration-300 text-center", stateColor)}>
            {stateLabel}
          </span>
          {isRecording && (
            <p className="text-xs text-emerald-200/65 text-center max-w-xs leading-relaxed px-2">
              When you&apos;re done speaking, tap the <span className="text-red-400/90 font-medium">red stop button</span>{" "}
              below — that sends your answer to the interviewer.
            </p>
          )}
        </div>

        {/* Transcript */}
        <div className="w-full flex-1 overflow-y-auto space-y-3 pb-4" style={{ maxHeight: "260px" }}>
          {transcript.map((entry, i) => (
            <div key={i} className={cn("flex gap-2.5", entry.role === "candidate" ? "flex-row-reverse" : "flex-row")}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={entry.role === "ai"
                  ? { background: "rgba(34,211,238,0.2)", border: "1px solid rgba(34,211,238,0.4)", color: "#22d3ee" }
                  : { background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399" }}>
                {entry.role === "ai" ? "Z" : name[0]?.toUpperCase()}
              </div>
              <div className="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={entry.role === "ai"
                  ? { background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.15)", color: "rgba(207,250,254,0.9)" }
                  : { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "rgba(167,243,208,0.9)" }}>
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

        {/* Stop recording button */}
        {isRecording && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={stopRecording}
              aria-label="Stop recording and send your answer"
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(239,68,68,0.2)", border: "2px solid rgba(239,68,68,0.6)", boxShadow: "0 0 30px rgba(239,68,68,0.3)" }}
            >
              <Square className="w-6 h-6 fill-red-400 text-red-400" />
            </button>
            <span className="text-xs font-semibold text-red-400/85 tracking-wide">Stop — send answer</span>
          </div>
        )}

        {aiSpeaking && (
          <p className="mt-4 text-xs text-cyan-800/60 text-center">
            Microphone will activate automatically when the interviewer finishes
          </p>
        )}
      </div>
    </div>
  );
}
