"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Ban, Clock, Loader2 } from "lucide-react";

interface AdminStatusButtonsProps {
  userId: string;
  currentStatus: "PENDING" | "APPROVED" | "SUSPENDED";
}

export default function AdminStatusButtons({ userId, currentStatus }: AdminStatusButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(status: "APPROVED" | "SUSPENDED" | "PENDING") {
    setLoading(status);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update status");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {currentStatus !== "APPROVED" && (
          <button
            onClick={() => updateStatus("APPROVED")}
            disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === "APPROVED" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve
          </button>
        )}

        {currentStatus !== "SUSPENDED" && (
          <button
            onClick={() => updateStatus("SUSPENDED")}
            disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === "SUSPENDED" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            Suspend
          </button>
        )}

        {currentStatus === "SUSPENDED" && (
          <button
            onClick={() => updateStatus("PENDING")}
            disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === "PENDING" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            Reset to Pending
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
