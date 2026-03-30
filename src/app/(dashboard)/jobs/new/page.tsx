"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  X,
  Plus,
  Sparkles,
  Pencil,
  Check,
  Trash2,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  GripVertical,
} from "lucide-react";

interface InterviewQuestion {
  id: string;
  text: string;
  type: string;
  followUpPrompt?: string;
}

interface InterviewScript {
  introduction: string;
  questions: InterviewQuestion[];
  scoringRubric?: Record<string, string>;
}

type Step = "details" | "review" | "saving";

const TYPE_COLOURS: Record<string, string> = {
  technical: "bg-blue-50 text-blue-700 border-blue-100",
  behavioral: "bg-purple-50 text-purple-700 border-purple-100",
  situational: "bg-amber-50 text-amber-700 border-amber-100",
  custom: "bg-green-50 text-green-700 border-green-100",
};

function typeBadge(type: string) {
  const cls = TYPE_COLOURS[type?.toLowerCase()] ?? "bg-gray-50 text-gray-600 border-gray-100";
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${cls}`}>
      {type || "general"}
    </span>
  );
}

export default function NewJobPage() {
  const router = useRouter();

  // ── Step 1: job details ──────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("details");
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [skill, setSkill] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: [] as string[],
    yearsExperience: 2,
    customQuestions: [] as string[],
  });

  // ── Step 2: review script ────────────────────────────────────────────────
  const [script, setScript] = useState<InterviewScript | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editFollowUp, setEditFollowUp] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [savingError, setSavingError] = useState("");

  // ── Details helpers ──────────────────────────────────────────────────────
  function addSkill() {
    if (skill.trim() && !form.requiredSkills.includes(skill.trim())) {
      setForm((f) => ({ ...f, requiredSkills: [...f.requiredSkills, skill.trim()] }));
      setSkill("");
    }
  }

  function removeSkill(s: string) {
    setForm((f) => ({ ...f, requiredSkills: f.requiredSkills.filter((x) => x !== s) }));
  }

  function addCustomQuestion() {
    if (customQuestion.trim()) {
      setForm((f) => ({ ...f, customQuestions: [...f.customQuestions, customQuestion.trim()] }));
      setCustomQuestion("");
    }
  }

  function removeCustomQuestion(q: string) {
    setForm((f) => ({ ...f, customQuestions: f.customQuestions.filter((x) => x !== q) }));
  }

  // ── Generate preview (Step 1 → Step 2) ──────────────────────────────────
  async function handleGeneratePreview(e: React.FormEvent) {
    e.preventDefault();
    if (form.requiredSkills.length === 0) {
      setDetailsError("Add at least one required skill");
      return;
    }
    setGeneratingPreview(true);
    setDetailsError("");

    const res = await fetch("/api/jobs/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setDetailsError(data.error || "Failed to generate questions");
      setGeneratingPreview(false);
      return;
    }

    setScript(data.interviewScript);
    setStep("review");
    setGeneratingPreview(false);
  }

  // ── Regenerate (re-call GPT from review step) ────────────────────────────
  async function handleRegenerate() {
    setGeneratingPreview(true);
    setReviewError("");
    setEditingId(null);

    const res = await fetch("/api/jobs/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setReviewError(data.error || "Failed to regenerate questions");
      setGeneratingPreview(false);
      return;
    }

    setScript(data.interviewScript);
    setGeneratingPreview(false);
  }

  // ── Edit question helpers ─────────────────────────────────────────────────
  function startEdit(q: InterviewQuestion) {
    setEditingId(q.id);
    setEditText(q.text);
    setEditFollowUp(q.followUpPrompt ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(id: string) {
    if (!editText.trim()) return;
    setScript((s) =>
      s
        ? {
            ...s,
            questions: s.questions.map((q) =>
              q.id === id
                ? { ...q, text: editText.trim(), followUpPrompt: editFollowUp.trim() || undefined }
                : q
            ),
          }
        : s
    );
    setEditingId(null);
  }

  function removeQuestion(id: string) {
    setScript((s) =>
      s ? { ...s, questions: s.questions.filter((q) => q.id !== id) } : s
    );
  }

  // ── Save job (Step 2 → redirect) ─────────────────────────────────────────
  async function handleSave() {
    if (!script || script.questions.length === 0) {
      setReviewError("You need at least one question before saving.");
      return;
    }
    setStep("saving");
    setSavingError("");

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, approvedScript: script }),
    });

    const data = await res.json();
    if (!res.ok) {
      setSavingError(data.error || "Failed to create job");
      setStep("review");
      return;
    }

    router.push(`/jobs/${data.job.id}`);
  }

  // ── Render: saving overlay ────────────────────────────────────────────────
  if (step === "saving") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto" />
          <p className="text-gray-700 font-medium">Creating your job and activating the interview link…</p>
          {savingError && (
            <p className="text-red-600 text-sm">{savingError}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Step 2 — review ───────────────────────────────────────────────
  if (step === "review" && script) {
    return (
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => { setStep("details"); setEditingId(null); }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Interview Questions</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Edit or remove any questions before saving. Changes only apply to this job.
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 ml-11">
          <span className="text-xs text-gray-400">Job Details</span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-xs font-semibold text-indigo-600">Review Questions</span>
        </div>

        {/* Introduction preview */}
        <div className="mb-5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">AI Introduction</p>
          <p className="text-sm text-gray-700 leading-relaxed">{script.introduction}</p>
        </div>

        {/* Questions */}
        <div className="space-y-3 mb-4">
          {script.questions.map((q, i) => (
            <div key={q.id}
              className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
              {editingId === q.id ? (
                /* ── Edit mode ── */
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Question {i + 1}
                    </span>
                    {typeBadge(q.type)}
                  </div>
                  <Textarea
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[88px] text-sm resize-none"
                    placeholder="Question text…"
                  />
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Follow-up prompt (optional)</Label>
                    <Input
                      value={editFollowUp}
                      onChange={(e) => setEditFollowUp(e.target.value)}
                      className="text-sm"
                      placeholder="e.g. Can you give a specific example?"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={() => saveEdit(q.id)}
                      disabled={!editText.trim()}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-400">Q{i + 1}</span>
                      {typeBadge(q.type)}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{q.text}</p>
                    {q.followUpPrompt && (
                      <p className="text-xs text-gray-400 mt-1.5 italic">
                        Follow-up: {q.followUpPrompt}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit question"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      disabled={script.questions.length <= 1}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Question count info */}
        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          {script.questions.length} question{script.questions.length !== 1 ? "s" : ""} will be asked during the interview.
        </p>

        {reviewError && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {reviewError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            size="lg"
            onClick={handleSave}
            className="flex-1"
            disabled={generatingPreview}
          >
            <Check className="w-4 h-4" />
            Approve & Save Job
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleRegenerate}
            loading={generatingPreview}
            disabled={generatingPreview}
            title="Ask GPT to regenerate the questions from scratch"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
        </div>
      </div>
    );
  }

  // ── Render: Step 1 — details ──────────────────────────────────────────────
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-500 text-sm mt-0.5">AI will generate a tailored interview script for your review</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 ml-11">
        <span className="text-xs font-semibold text-indigo-600">Job Details</span>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-xs text-gray-400">Review Questions</span>
      </div>

      <form onSubmit={handleGeneratePreview} className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Senior Backend Engineer"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="min-h-[140px]"
            required
            minLength={50}
          />
          <p className="text-xs text-gray-400">Minimum 50 characters. The more detail, the better the interview.</p>
        </div>

        {/* Years */}
        <div className="space-y-1.5">
          <Label htmlFor="years">Years of Experience Required</Label>
          <Input
            id="years"
            type="number"
            min={0}
            max={20}
            value={form.yearsExperience}
            onChange={(e) => setForm((f) => ({ ...f, yearsExperience: parseInt(e.target.value) || 0 }))}
            className="w-32"
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Required Skills *</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Node.js, PostgreSQL..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          {form.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.requiredSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}>
                    <X className="w-3 h-3 hover:text-indigo-900" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Custom Questions */}
        <div className="space-y-2">
          <Label>Custom Questions <span className="text-gray-400 font-normal">(optional)</span></Label>
          <p className="text-xs text-gray-400">These will be included in the AI-generated script.</p>
          <div className="flex gap-2">
            <Input
              placeholder="Add a specific question for the AI to ask..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomQuestion())}
            />
            <Button type="button" variant="outline" onClick={addCustomQuestion}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          {form.customQuestions.length > 0 && (
            <div className="space-y-2 mt-2">
              {form.customQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600 flex-1">{q}</span>
                  <button type="button" onClick={() => removeCustomQuestion(q)}>
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {detailsError && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {detailsError}
          </div>
        )}

        {/* AI Notice */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900">AI Interview Generation</p>
            <p className="text-sm text-indigo-600 mt-0.5">
              Our AI will generate tailored interview questions for your review. You can edit or remove any question before the interview goes live.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" loading={generatingPreview} className="flex-1">
            <Sparkles className="w-4 h-4" />
            {generatingPreview ? "Generating Questions…" : "Generate Interview Questions"}
          </Button>
          <Link href="/jobs">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
