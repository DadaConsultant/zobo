"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, X, Plus, Sparkles } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skill, setSkill] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: [] as string[],
    yearsExperience: 2,
    customQuestions: [] as string[],
  });

  function addSkill() {
    if (skill.trim() && !form.requiredSkills.includes(skill.trim())) {
      setForm((f) => ({ ...f, requiredSkills: [...f.requiredSkills, skill.trim()] }));
      setSkill("");
    }
  }

  function removeSkill(s: string) {
    setForm((f) => ({ ...f, requiredSkills: f.requiredSkills.filter((x) => x !== s) }));
  }

  function addQuestion() {
    if (customQuestion.trim()) {
      setForm((f) => ({ ...f, customQuestions: [...f.customQuestions, customQuestion.trim()] }));
      setCustomQuestion("");
    }
  }

  function removeQuestion(q: string) {
    setForm((f) => ({ ...f, customQuestions: f.customQuestions.filter((x) => x !== q) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.requiredSkills.length === 0) {
      setError("Add at least one required skill");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create job");
      setLoading(false);
      return;
    }

    router.push(`/jobs/${data.job.id}`);
  }

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
          <p className="text-gray-500 text-sm mt-0.5">AI will generate a tailored interview script</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="flex gap-2">
            <Input
              placeholder="Add a specific question for the AI to ask..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQuestion())}
            />
            <Button type="button" variant="outline" onClick={addQuestion}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          {form.customQuestions.length > 0 && (
            <div className="space-y-2 mt-2">
              {form.customQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600 flex-1">{q}</span>
                  <button type="button" onClick={() => removeQuestion(q)}>
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* AI Notice */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900">AI Interview Generation</p>
            <p className="text-sm text-indigo-600 mt-0.5">
              Our AI will analyze your job details and generate 6–8 tailored interview questions with a scoring rubric. This takes about 10–15 seconds.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" loading={loading} className="flex-1">
            <Sparkles className="w-4 h-4" />
            {loading ? "Generating Interview..." : "Create Job & Generate Interview"}
          </Button>
          <Link href="/jobs">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
