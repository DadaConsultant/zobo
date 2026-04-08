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
1. An "introduction" string (2-3 sentences): Zobo introduces itself by name, warmly welcomes the candidate, briefly says this is a first-round AI screening, and ends with a natural lead-in to the first question such as "Here's my first question for you:" or "Let's dive straight in:" — do NOT include the question itself in the introduction
2. A "questions" array of 6-8 interview questions. Each question should have:
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

/** What kind of reply to generate after the candidate's latest answer */
export type InterviewReplyPhase = "follow_up" | "advance" | "closing";

export interface AIInterviewReply {
  message: string;
  /** When true, the client should end the session after speaking this message */
  endSession: boolean;
}

export async function generateAIResponse(
  transcript: TranscriptEntry[],
  currentQuestion: InterviewQuestion,
  nextQuestion: InterviewQuestion | null,
  jobContext: JobContext,
  replyPhase: InterviewReplyPhase
): Promise<AIInterviewReply> {
  const phaseInstructions =
    replyPhase === "follow_up"
      ? `Reply phase: FOLLOW-UP (same question, not the end of the interview).
You are still on this question: "${currentQuestion.text}"
Follow-up guidance: ${currentQuestion.followUpPrompt || "If the answer was brief or vague, ask for one specific real-world example or clarification."}
Acknowledge their answer briefly, then ask ONE concise follow-up. Do NOT wrap up the interview, do NOT say the recruiter will be in touch, do NOT imply this was their last chance to speak — more of the interview will follow after they answer again.`
      : replyPhase === "advance"
        ? nextQuestion
          ? `Reply phase: MOVE TO NEXT TOPIC.
After a brief acknowledgment, transition naturally into the next area — do NOT announce "next question" or "question two". Weave it in like a real phone screen. Next topic to lead into: "${nextQuestion.text}"`
          : `Reply phase: MOVE ON (no further scripted topics in metadata — treat as closing).
Give a warm, genuine closing: briefly reference something you appreciated, say the recruiter will review and be in touch, wish them well.`
        : `Reply phase: CLOSING (this was their last answer on the final scripted question).
Give a warm and genuine closing: briefly reference something specific you appreciated from the conversation, let them know the recruiter will review and be in touch, and wish them well. Make it feel like the natural end of a real phone call. Do NOT ask another interview question.`;

  const systemPrompt = `You are Zobo, a warm and experienced AI recruiter conducting a first-round telephone screening for a ${jobContext.title} role.

Your voice and tone:
- Sound like a real recruiter on a phone call — natural, human, and engaged
- If the candidate's last message indicates the timed answer window ended (e.g. it mentions moving on to stay on schedule or time expired for this question), acknowledge briefly that you're moving forward to keep the interview on time — still follow the reply phase instructions below for what to say next.
- ALWAYS begin with a brief, genuine acknowledgment of what the candidate just said (one short sentence). Vary these: "That's a great example.", "Really interesting — thanks for sharing that.", "I appreciate that.", "That makes a lot of sense.", "Good to know.", "Helpful context, thank you.", "That's a solid answer."
- Use natural connectors when appropriate: "Building on that...", "On a related note...", "I'd also love to understand..."
- Speak in flowing sentences — never bullet points or lists
- Reference something the candidate said earlier when relevant

${phaseInstructions}

Early exit: If the candidate clearly asks to stop, end, or leave the interview (e.g. "I have to go", "please end this", "I'd like to stop now"), respond with a very brief warm closing and set endSession to true — do not ask another question.

Output format — return ONLY valid JSON (no markdown):
{"message":"<exactly what Zobo should say aloud, 2–3 short sentences unless closing>","endSession":<true|false>}

Rules for endSession:
- If reply phase is "closing", endSession MUST be true.
- If the candidate clearly requested to end the interview early, endSession MUST be true.
- Otherwise endSession MUST be false (including follow_up and advance phases when they did not ask to stop).

Other rules:
- Never share salary details, undisclosed company information, or make promises about the outcome
- If asked about compensation: say the recruiter will walk through details at the next stage
- Politely redirect if the candidate goes off-topic
- Role: ${jobContext.title} | Required skills: ${jobContext.requiredSkills.join(", ")}`;

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
    temperature: 0.7,
    max_tokens: 350,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content || "{}";
  let parsed: { message?: string; endSession?: boolean };
  try {
    parsed = JSON.parse(raw) as { message?: string; endSession?: boolean };
  } catch {
    return { message: "Thank you for sharing that. Let's continue.", endSession: false };
  }

  const message =
    typeof parsed.message === "string" && parsed.message.trim()
      ? parsed.message.trim()
      : "Thank you for sharing that. Let's continue.";

  const endSession =
    replyPhase === "closing" ? true : Boolean(parsed.endSession);

  return { message, endSession };
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
