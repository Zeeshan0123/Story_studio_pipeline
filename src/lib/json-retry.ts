import "server-only";
import { callGroq, type ChatMessage } from "./groq";

export class InvalidLlmJsonError extends Error {
  constructor(public rawText: string) {
    super("LLM did not return valid JSON after retry.");
  }
}

export function stripCodeFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```[a-zA-Z]*\n?/, "");
    t = t.trim().replace(/```$/, "");
  }
  return t.trim();
}

export async function generateJsonWithRetry<T = unknown>(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  maxCompletionTokens = 900,
  temperature = 0.6,
): Promise<T> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const raw = await callGroq(messages, model, maxCompletionTokens, temperature);
  try {
    return JSON.parse(stripCodeFences(raw)) as T;
  } catch {
    messages.push({ role: "assistant", content: raw });
    messages.push({
      role: "user",
      content:
        "You returned invalid JSON. Return ONLY valid JSON, no markdown, no code fences, no commentary.",
    });

    const raw2 = await callGroq(messages, model, maxCompletionTokens, temperature);
    try {
      return JSON.parse(stripCodeFences(raw2)) as T;
    } catch {
      throw new InvalidLlmJsonError(raw2);
    }
  }
}
