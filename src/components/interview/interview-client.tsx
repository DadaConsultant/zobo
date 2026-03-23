"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Volume2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

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

export default function InterviewClient({ token, jobTitle, company }: InterviewClientProps) {
  const [phase, setPhase] = useState<Phase>("entry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Interview state
  const [interviewId, setInterviewId] = useState("");
  const [script, setScript] = useState<InterviewScript | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const currentQuestion = script?.questions[questionIndex];
  const totalQuestions = script?.questions.length || 0;
  const progress = totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

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

    if (!res.ok) {
      setError(data.error || "Failed to start");
      return;
    }

    setInterviewId(data.interviewId);
    setScript(data.interviewScript as InterviewScript);
    setPhase("permission");
  }

  async function requestMicPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPhase("interview");
    } catch {
      setError("Microphone access is required. Please allow microphone access and try again.");
    }
  }

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
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setAiSpeaking(false);
          URL.revokeObjectURL(url);
        };
        await audioRef.current.play();
      }
    } catch {
      setAiSpeaking(false);
    }
  }, [interviewId]);

  // Start interview with AI intro
  useEffect(() => {
    if (phase === "interview" && script && transcript.length === 0) {
      const intro = script.introduction;
      const firstQuestion = script.questions[0];
      const fullIntro = `${intro} ${firstQuestion.text}`;

      const entry: TranscriptEntry = {
        role: "ai",
        content: fullIntro,
        timestamp: Date.now(),
      };
      setTranscript([entry]);
      speakText(fullIntro);
    }
  }, [phase, script, transcript.length, speakText]);

  function startRecording() {
    if (aiSpeaking) return;

    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        await processAudio();
      };

      recorder.start();
      setIsRecording(true);
    });
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsThinking(true);
  }

  async function processAudio() {
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    let candidateText = "";
    try {
      const res = await fetch(`/api/interviews/${interviewId}/stt`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      candidateText = data.transcript || "";
    } catch {
      candidateText = "[Audio could not be transcribed]";
    }

    if (!candidateText.trim()) {
      setIsThinking(false);
      return;
    }

    const candidateEntry: TranscriptEntry = {
      role: "candidate",
      content: candidateText,
      timestamp: Date.now(),
    };

    const updatedTranscript = [...transcript, candidateEntry];
    setTranscript(updatedTranscript);

    if (!currentQuestion) return;
    const nextQuestion = script?.questions[questionIndex + 1] || null;

    // Decide: follow up or advance
    const shouldAdvance = followUpCount >= 1 || updatedTranscript.filter(t => t.role === "candidate").length > questionIndex + 1;

    let aiText = "";
    try {
      const res = await fetch(`/api/interviews/${interviewId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: updatedTranscript,
          currentQuestion,
          nextQuestion: shouldAdvance ? nextQuestion : null,
        }),
      });
      const data = await res.json();
      aiText = data.response || "";
    } catch {
      aiText = "Thank you for that answer. Let's continue.";
    }

    if (shouldAdvance && questionIndex < totalQuestions - 1) {
      setQuestionIndex((i) => i + 1);
      setFollowUpCount(0);
    } else if (shouldAdvance && questionIndex >= totalQuestions - 1) {
      // Last question answered
      const aiEntry: TranscriptEntry = { role: "ai", content: aiText, timestamp: Date.now() };
      const finalTranscript = [...updatedTranscript, aiEntry];
      setTranscript(finalTranscript);
      setIsThinking(false);
      await speakText(aiText);
      await completeInterview(finalTranscript);
      return;
    } else {
      setFollowUpCount((c) => c + 1);
    }

    const aiEntry: TranscriptEntry = { role: "ai", content: aiText, timestamp: Date.now() };
    setTranscript((t) => [...t, aiEntry]);
    setIsThinking(false);
    await speakText(aiText);
  }

  async function completeInterview(finalTranscript: TranscriptEntry[]) {
    await fetch(`/api/interviews/${interviewId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: finalTranscript }),
    });
    setPhase("complete");
  }

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
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Continue
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "permission") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Microphone Access Required</h1>
          <p className="text-gray-500 mb-2">
            This AI interview uses your microphone to hear your responses.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Click below and allow microphone access when your browser asks.
          </p>
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
              <li>✓ The interview lasts 10–15 minutes</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Interview Complete!</h1>
          <p className="text-gray-500 mb-2">
            Thank you, {name}! Your interview has been submitted successfully.
          </p>
          <p className="text-sm text-gray-400">
            The recruiter will review your results and be in touch if you&apos;re shortlisted.
          </p>
          <div className="mt-8 text-xs text-gray-300">Powered by Zobo Jobs</div>
        </div>
      </div>
    );
  }

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

  // Interview phase
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <audio ref={audioRef} className="hidden" />

      {/* Top bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">{jobTitle}</p>
            <p className="text-gray-400 text-xs">{company}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">
              Question {Math.min(questionIndex + 1, totalQuestions)} of {totalQuestions}
            </p>
            <div className="w-32">
              <Progress value={progress} className="bg-gray-700 h-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                entry.role === "candidate" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                entry.role === "ai" ? "bg-indigo-600 text-white" : "bg-gray-600 text-gray-200"
              )}>
                {entry.role === "ai" ? "Z" : name[0]?.toUpperCase()}
              </div>
              <div className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                entry.role === "ai" ? "bg-gray-800 text-gray-100" : "bg-indigo-600 text-white"
              )}>
                {entry.content}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-2xl flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                <span className="text-gray-400 text-sm">Thinking...</span>
              </div>
            </div>
          )}
        </div>
        <div ref={transcriptEndRef} />
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          {aiSpeaking ? (
            <div className="flex items-center gap-3 text-indigo-400">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">AI is speaking...</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-indigo-400 rounded-full animate-pulse"
                    style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                {isRecording ? "Recording... tap to stop" : "Tap to speak your answer"}
              </p>
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={aiSpeaking || isThinking}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
                  isRecording
                    ? "bg-red-500 scale-110 shadow-red-500/30 shadow-2xl"
                    : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-indigo-500/30",
                  (aiSpeaking || isThinking) && "opacity-40 cursor-not-allowed"
                )}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
              {isRecording && (
                <div className="flex justify-center gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-400 rounded-full animate-bounce"
                      style={{ height: `${6 + Math.random() * 14}px`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-600 text-center">
            Hold to record · Release to submit
          </p>
        </div>
      </div>
    </div>
  );
}
