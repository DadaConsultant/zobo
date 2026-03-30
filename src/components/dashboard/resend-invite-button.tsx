"use client";

import { useState } from "react";
import { Send, Check, Ban } from "lucide-react";

interface ResendInviteButtonProps {
  candidateId: string;
  resendCount: number;
}

const MAX_RESENDS = 1;

export default function ResendInviteButton({
  candidateId,
  resendCount: initialResendCount,
}: ResendInviteButtonProps) {
  const [resendCount, setResendCount] = useState(initialResendCount);
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const limitReached = resendCount >= MAX_RESENDS;

  async function handleResend() {
    if (limitReached || state === "loading") return;
    setState("loading");
    setErrorMsg("");

    const res = await fetch(`/api/candidates/${candidateId}/resend-invite`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setState("error");
      setErrorMsg(data.error || "Failed to resend");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setResendCount(data.resendCount);
    setState("sent");
  }

  if (limitReached) {
    return (
      <span
        title="Resend limit reached (1 resend per candidate)"
        className="inline-flex items-center gap-1 text-xs text-gray-400 cursor-not-allowed"
      >
        <Ban className="w-3.5 h-3.5" />
        Resend limit reached
      </span>
    );
  }

  if (state === "sent") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
        <Check className="w-3.5 h-3.5" />
        Invite resent
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-500">
        {errorMsg}
      </span>
    );
  }

  return (
    <button
      onClick={handleResend}
      disabled={state === "loading"}
      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Send className="w-3.5 h-3.5" />
      {state === "loading" ? "Sending…" : "Resend invite"}
    </button>
  );
}
