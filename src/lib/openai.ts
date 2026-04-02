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

export async function generateAIResponse(
  transcript: TranscriptEntry[],
  currentQuestion: InterviewQuestion,
  nextQuestion: InterviewQuestion | null,
  jobContext: JobContext
): Promise<string> {
  const systemPrompt = `You are Zobo, a warm and experienced AI recruiter conducting a first-round telephone screening for a ${jobContext.title} role.

Your voice and tone:
- Sound like a real recruiter on a phone call — natural, human, and engaged
- ALWAYS begin your response with a brief, genuine acknowledgment of what the candidate just said (one short sentence). Vary these naturally so they never feel repetitive. Examples: "That's a great example.", "Really interesting — thanks for sharing that.", "I appreciate that.", "That makes a lot of sense.", "Good to know.", "Helpful context, thank you.", "That's a solid answer."
- Use natural connectors when transitioning: "Building on that...", "On a related note...", "That's actually a nice lead-in to my next question...", "I'd also love to understand..."
- Speak in flowing sentences — never bullet points or lists
- Reference something the candidate said earlier when it's relevant, to show you've been listening

Current question context: "${currentQuestion.text}"
Follow-up guidance: ${currentQuestion.followUpPrompt || "If the answer was brief or vague, ask for a specific real-world example"}

${nextQuestion
  ? `When you are ready to move on, transition naturally — do NOT announce "next question" or "moving on to question two". Weave it in as a real interviewer would. Next topic to lead into: "${nextQuestion.text}"`
  : `This is the final question. Once the candidate has answered, give a warm and genuine closing: briefly reference something specific you appreciated from the conversation, let them know the recruiter will review and be in touch, and wish them well. Make it feel like the natural end of a real phone call.`}

Rules:
- Keep responses to 2–3 sentences maximum — concise but warm
- Never share salary details, undisclosed company information, or make promises about the outcome
- If asked about compensation: "The recruiter will walk you through the details at the next stage."
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
    max_tokens: 250,
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
