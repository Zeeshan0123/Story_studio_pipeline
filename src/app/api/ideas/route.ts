import { NextResponse } from "next/server";
import { buildIdeaSystemPrompt, buildIdeaUserPrompt } from "@/lib/idea-prompt";
import { generateJsonWithRetry, InvalidLlmJsonError } from "@/lib/json-retry";
import { GroqConfigError, GroqRequestError } from "@/lib/groq";
import { getChannel } from "@/lib/channels";
import { findGenre, findTheme } from "@/lib/genres";
import { GenerateIdeasRequestSchema, IdeaSchema } from "@/lib/schema";
import type { GenerateIdeasResponse } from "@/types/pipeline";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = GenerateIdeasRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  }

  const channel = await getChannel(parsed.data.channelId);
  if (!channel) {
    return NextResponse.json({ error: "Channel not found." }, { status: 404 });
  }
  const model = parsed.data.model || process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
  const genre = findGenre(parsed.data.genreId);
  const theme = findTheme(parsed.data.genreId, parsed.data.themeId);

  const systemPrompt = buildIdeaSystemPrompt(channel.name, channel.description, genre, theme);
  const userPrompt = buildIdeaUserPrompt();

  let result: GenerateIdeasResponse;
  try {
    result = await generateJsonWithRetry<GenerateIdeasResponse>(systemPrompt, userPrompt, model, 950, 0.85);
  } catch (err) {
    if (err instanceof InvalidLlmJsonError) {
      return NextResponse.json(
        {
          error: "The model did not return valid JSON after one retry.",
          detail: err.rawText.slice(0, 2000),
        },
        { status: 502 },
      );
    }
    if (err instanceof GroqConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof GroqRequestError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    throw err;
  }

  // Validate each idea independently rather than the whole array at once —
  // ideas are standalone items (unlike ordered/duration-summed scenes), so
  // one malformed idea (e.g. truncated right at the token budget edge)
  // shouldn't throw away the rest of an otherwise-good batch.
  const rawIdeas = (result as { ideas?: unknown })?.ideas;
  if (!Array.isArray(rawIdeas)) {
    return NextResponse.json(
      {
        error: "The model returned JSON with an unexpected shape.",
        detail: JSON.stringify(result).slice(0, 2000),
      },
      { status: 502 },
    );
  }

  const ideas = rawIdeas
    .map((item) => IdeaSchema.safeParse(item))
    .filter((check) => check.success)
    .map((check) => check.data);

  if (ideas.length === 0) {
    return NextResponse.json(
      {
        error: "The model returned JSON with an unexpected shape.",
        detail: JSON.stringify(result).slice(0, 2000),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ideas }, { status: 200 });
}
