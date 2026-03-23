"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";

interface JobActionsProps {
  jobId: string;
  currentStatus: string;
}

export default function JobActions({ jobId, currentStatus }: JobActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  async function deleteJob() {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    router.push("/jobs");
  }

  return (
    <div className="relative">
      <Button variant="outline" size="icon" onClick={() => setOpen(!open)}>
        <MoreHorizontal className="w-4 h-4" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-48 py-1">
            {currentStatus === "ACTIVE" ? (
              <button
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => updateStatus("PAUSED")}
              >
                <Pause className="w-4 h-4" /> Pause Job
              </button>
            ) : (
              <button
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => updateStatus("ACTIVE")}
              >
                <Play className="w-4 h-4" /> Resume Job
              </button>
            )}
            <button
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
              onClick={deleteJob}
            >
              <Trash2 className="w-4 h-4" /> Delete Job
            </button>
          </div>
        </>
      )}
    </div>
  );
}
