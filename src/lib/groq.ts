import "server-only";
import Groq from "groq-sdk";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class GroqConfigError extends Error {}
export class GroqRequestError extends Error {}

export async function callGroq(
  messages: ChatMessage[],
  model: string,
  maxCompletionTokens = 900,
  temperature = 0.6,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqConfigError("GROQ_API_KEY is not configured on the server.");
  }

  const client = new Groq({ apiKey });

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      // Groq's free tier caps output tokens per minute at 1000; the SDK's
      // unset default requests more than that and gets a 429 immediately.
      max_completion_tokens: maxCompletionTokens,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new GroqRequestError(`Groq request failed: ${message}`);
  }

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new GroqRequestError(`Unexpected Groq response shape: ${JSON.stringify(completion)}`);
  }
  return content;
}
