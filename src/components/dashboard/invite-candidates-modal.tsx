"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, X, Plus, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface InviteCandidatesModalProps {
  jobId: string;
  /** Applied to the trigger button (e.g. `w-full sm:w-auto` on narrow layouts). */
  triggerClassName?: string;
}

export default function InviteCandidatesModal({ jobId, triggerClassName }: InviteCandidatesModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    invited: number;
    total: number;
    alreadyInvited: number;
    failed: number;
  } | null>(null);
  const [candidates, setCandidates] = useState([{ name: "", email: "" }]);

  function addRow() {
    setCandidates((c) => [...c, { name: "", email: "" }]);
  }

  function removeRow(i: number) {
    setCandidates((c) => c.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: "name" | "email", value: string) {
    setCandidates((c) => c.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = candidates.filter((c) => c.name && c.email);
    if (!valid.length) return;

    setLoading(true);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, candidates: valid }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      const s = data.summary;
      setSuccess({
        invited: s.invited,
        total: s.total,
        alreadyInvited: s.alreadyInvited ?? 0,
        failed: s.failed ?? 0,
      });
      router.refresh();
    }
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").slice(1); // skip header
    const parsed = lines
      .map((line) => {
        const [name, email] = line.split(",").map((s) => s.trim().replace(/"/g, ""));
        return { name, email };
      })
      .filter((c) => c.name && c.email);

    if (parsed.length) setCandidates(parsed);
  }

  function close() {
    setOpen(false);
    setSuccess(null);
    setCandidates([{ name: "", email: "" }]);
  }

  return (
    <>
      <Button variant="outline" className={triggerClassName} onClick={() => setOpen(true)}>
        <Mail className="h-4 w-4" />
        Invite Candidates
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Invite Candidates</h2>
                <p className="text-sm text-gray-500">They&apos;ll receive an email with the interview link</p>
              </div>
              <button onClick={close} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                {success.invited === success.total ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Invites sent</h3>
                  </>
                ) : success.invited > 0 ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Partially complete</h3>
                  </>
                ) : success.failed > 0 ? (
                  <>
                    <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Invites could not be sent</h3>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No new invites</h3>
                  </>
                )}
                <p className="text-gray-500">
                  {success.invited} of {success.total} candidates were successfully invited.
                  {success.invited === 0 && success.total > 0 && (
                    <>
                      {success.alreadyInvited > 0 && (
                        <span className="block mt-2">
                          {success.alreadyInvited} {success.alreadyInvited === 1 ? "was" : "were"} already invited for this job.
                        </span>
                      )}
                      {success.failed > 0 && (
                        <span className="block mt-2 text-amber-700">
                          {success.failed === 1
                            ? "We couldn’t send that invitation email. Please try again in a few minutes. If it keeps failing, contact support."
                            : `We couldn’t send ${success.failed} invitation emails. Please try again in a few minutes. If it keeps failing, contact support.`}
                        </span>
                      )}
                    </>
                  )}
                </p>
                <Button className="mt-6" onClick={close}>Done</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* CSV Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Upload CSV (name, email)</p>
                  <label className="cursor-pointer text-sm text-indigo-600 font-medium hover:underline">
                    Choose file
                    <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-400">or add manually</span>
                  </div>
                </div>

                {/* Manual rows */}
                <div className="space-y-2">
                  {candidates.map((c, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <Input placeholder="Name" value={c.name} onChange={(e) => update(i, "name", e.target.value)} />
                      <Input placeholder="Email" type="email" value={c.email} onChange={(e) => update(i, "email", e.target.value)} />
                      {candidates.length > 1 && (
                        <button type="button" onClick={() => removeRow(i)} className="mt-2.5 text-gray-300 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add another
                </button>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" loading={loading}>
                    Send Invites
                  </Button>
                  <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
