// lib/groqGrader.ts
// import fetch from "node-fetch";
import { IScenario } from "../interfaces/scenario.types";

interface GradeResult {
  score: number;
  feedback: string;
}

// interface Choice {
//   message: {
//     content: string;
//   };
// }

// interface ApiResponse {
//   choices: Choice[];
//   // ... other properties
// }

export async function gradeScenarioAnswerWithGroq(
  scenario: IScenario,
  answer: string
): Promise<GradeResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not set");
  }

  const systemPrompt = `
You are an expert evaluator helping grade student responses.

You must:
1. Read the scenario.
2. Read the student's answer.
3. Evaluate the answer strictly based on the rubric.
4. Assign a score from 0 to ${scenario.maxScore}.
5. Provide concise, constructive feedback.
6. Detect use of ai language in response. Make sure to score it low
7. Detect use of more natural human language and response to the question. Make sure to score it high.
8. In scoring don't give ${scenario.maxScore} as a score. Provide room that the answer can be better if need be as a form of feedback.

Return ONLY valid JSON, no markdown.
`;

  const userPrompt = {
    scenario: {
      id: scenario.id,
      title: scenario.title,
      instructions: scenario.instructions,
    },
    rubric: scenario.rubric,
    maxScore: scenario.maxScore,
    studentAnswer: answer,
    instructions: `
Grade the answer fairly.

Respond with:
{
  "score": number,        // between 0 and ${scenario.maxScore}
  "feedback": string      // 2-4 sentences of feedback
}
`,
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "groq/compound-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPrompt) },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Groq error:", text);
    throw new Error("AI grading failed");
  }

  const json = await res.json() as any
  const raw = json.choices?.[0]?.message?.content || "{}";

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse Groq response:", raw);
    throw new Error("AI returned invalid JSON");
  }

  return {
    score: parsed.score ?? 0,
    feedback: parsed.feedback ?? "No feedback provided.",
  };
}
