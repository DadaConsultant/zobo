import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface JobContext {
  title: string;
  description: string;
  requiredSkills: string[];
  yearsExperience: number;
  customQuestions?: string[];
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: "technical" | "behavioral" | "situational" | "custom";
  followUpPrompt?: string;
}

export interface InterviewScript {
  introduction: string;
  questions: InterviewQuestion[];
  scoringRubric: Record<string, string>;
}

export async function generateInterviewScript(
  job: JobContext
): Promise<InterviewScript> {
  const prompt = `You are an expert technical recruiter. Generate a structured interview script for the following job:

Job Title: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.requiredSkills.join(", ")}
Years of Experience Required: ${job.yearsExperience}
${job.customQuestions?.length ? `Custom Questions to Include:\n${job.customQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : ""}

Generate a JSON object with:
1. An "introduction" string (AI introduces itself, the company context, and the role - 2-3 sentences)
2. A "questions" array of exactly 2 interview questions. Each question should have:
   - "id": unique string
   - "text": the question text
   - "type": one of "technical", "behavioral", "situational", "custom"
   - "followUpPrompt": a follow-up instruction for the AI to probe deeper
3. A "scoringRubric" object mapping criteria to descriptions: technical_knowledge, communication, problem_solving, experience_fit, confidence

Focus questions on: ${job.requiredSkills.join(", ")}.
Make questions conversational, clear, and relevant to a ${job.yearsExperience}+ year experience level.

Return ONLY valid JSON, no markdown.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content from OpenAI");

  return JSON.parse(content) as InterviewScript;
}

export interface TranscriptEntry {
  role: "ai" | "candidate";
  content: string;
  timestamp: number;
}

export async function generateAIResponse(
  transcript: TranscriptEntry[],
  currentQuestion: InterviewQuestion,
  nextQuestion: InterviewQuestion | null,
  jobContext: JobContext
): Promise<string> {
  const systemPrompt = `You are Zobo, an AI interview assistant conducting a first-round screening interview for a ${jobContext.title} role.

Your behavior:
- Be professional, warm, and conversational
- Ask focused follow-up questions when answers are vague
- Keep responses brief (1-3 sentences max)
- Do NOT share salary information, company details not in the job description, or make assumptions
- If asked about compensation or details not provided, say: "The recruiter will provide more details in the next stage."
- If a candidate is inappropriate or disrespectful, warn them once, then end the interview

Current question being evaluated: "${currentQuestion.text}"
Follow-up guidance: ${currentQuestion.followUpPrompt || "Ask for clarification if needed"}

${nextQuestion ? `Next question to transition to when ready: "${nextQuestion.text}"` : "This is the last question. Wrap up the interview gracefully."}

Job context: ${jobContext.title} requiring ${jobContext.requiredSkills.join(", ")}`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...transcript.map((t) => ({
      role: t.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: t.content,
    })),
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.6,
    max_tokens: 200,
  });

  return response.choices[0].message.content || "";
}

export interface CandidateScores {
  technical_knowledge: number;
  communication: number;
  problem_solving: number;
  experience_fit: number;
  confidence: number;
  overall: number;
}

export interface EvaluationResult {
  scores: CandidateScores;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  recommendation: boolean;
}

export async function evaluateInterview(
  transcript: TranscriptEntry[],
  job: JobContext
): Promise<EvaluationResult> {
  const transcriptText = transcript
    .map((t) => `${t.role === "ai" ? "Interviewer" : "Candidate"}: ${t.content}`)
    .join("\n");

  const prompt = `You are an expert recruiter evaluating a candidate interview for: ${job.title}

Required skills: ${job.requiredSkills.join(", ")}
Required experience: ${job.yearsExperience}+ years

Interview transcript:
${transcriptText}

Evaluate this candidate and return a JSON object with:
{
  "scores": {
    "technical_knowledge": <0-100>,
    "communication": <0-100>,
    "problem_solving": <0-100>,
    "experience_fit": <0-100>,
    "confidence": <0-100>,
    "overall": <0-100, weighted average>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "summary": "2-3 sentence summary of the candidate",
  "recommendation": true or false
}

Be objective and base scoring only on what was said in the interview.
Return ONLY valid JSON.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No evaluation content");

  return JSON.parse(content) as EvaluationResult;
}
