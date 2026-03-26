"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: "icon" | "button";
  className?: string;
}

export default function CopyButton({
  text,
  label = "Copy Link",
  variant = "button",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          "text-xs font-medium transition-colors",
          copied ? "text-green-600" : "text-indigo-600 hover:text-indigo-700",
          className
        )}
      >
        {copied ? "Copied!" : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium bg-white border rounded-lg px-3 py-2 transition-colors",
        copied
          ? "text-green-600 border-green-200 hover:bg-green-50"
          : "text-indigo-600 border-indigo-200 hover:text-indigo-700 hover:bg-indigo-50",
        className
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : label}
    </button>
  );
}
