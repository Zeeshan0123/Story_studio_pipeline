import { NextResponse } from "next/server";
import { buildSystemPrompt, buildUserPrompt, computeSceneCount, computeMaxWords } from "@/lib/prompt-builder";
import { buildUploadPackageSystemPrompt, buildUploadPackageUserPrompt } from "@/lib/upload-package-prompt";
import { generateJsonWithRetry, InvalidLlmJsonError } from "@/lib/json-retry";
import { GroqConfigError, GroqRequestError } from "@/lib/groq";
import { getCharacterBible, injectCharacterBible, CONTINUITY_LINE } from "@/lib/character-bible";
import { getChannel } from "@/lib/channels";
import { findGenre, findTheme } from "@/lib/genres";
import { validateScript } from "@/lib/validate-script";
import { buildPromptsTxt, formatDialogue } from "@/lib/format-prompts-txt";
import { GenerateRequestSchema, RawLlmResultSchema, UploadPackageSchema } from "@/lib/schema";
import type { Channel, GenerateResponse, RawLlmResult, Scene, UploadPackage } from "@/types/pipeline";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  }
  const { idea, durationSec, channelId, bucket, genreId, themeId } = parsed.data;
  const model = parsed.data.model || process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
  const genre = findGenre(genreId);
  const theme = findTheme(genreId, themeId);

  const channel = await getChannel(channelId);
  if (!channel) {
    return NextResponse.json({ error: "Channel not found." }, { status: 404 });
  }

  const sceneCount = computeSceneCount(durationSec);
  const bible = await getCharacterBible(channelId);
  const characterNames = bible.characters.map((c) => c.name);

  const systemPrompt = buildSystemPrompt(
    channel.name,
    channel.description,
    durationSec,
    sceneCount,
    computeMaxWords(durationSec),
    characterNames,
    bucket,
    genre,
    theme,
  );
  const userPrompt = buildUserPrompt(idea, durationSec, sceneCount);

  let result: RawLlmResult;
  try {
    result = await generateJsonWithRetry<RawLlmResult>(systemPrompt, userPrompt, model);
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

  const shapeCheck = RawLlmResultSchema.safeParse(result);
  if (!shapeCheck.success) {
    return NextResponse.json(
      {
        error: "The model returned JSON with an unexpected shape.",
        detail: JSON.stringify(result).slice(0, 2000),
      },
      { status: 502 },
    );
  }
  const raw = shapeCheck.data;

  const scenes: Scene[] = raw.scenes.map((s, i) => {
    let finalVideoPrompt = injectCharacterBible(s.video_prompt, bible);
    if (i > 0) {
      finalVideoPrompt += "\n" + CONTINUITY_LINE;
    }
    return {
      id: s.id,
      durationSec: s.duration_sec,
      dialogue: s.dialogue,
      videoPrompt: s.video_prompt,
      finalVideoPrompt,
    };
  });

  const warnings = validateScript(raw, durationSec);

  // Best-effort: a failure here shouldn't lose the scenes that already
  // succeeded, so this never throws — it just omits uploadPackage.
  const uploadPackage = await tryGenerateUploadPackage(idea, scenes, durationSec, model, channel);

  const response: GenerateResponse = {
    model,
    durationSec,
    sceneCount,
    warnings,
    scenes,
    promptsTxt: buildPromptsTxt(scenes),
    uploadPackage,
  };

  return NextResponse.json(response, { status: 200 });
}

async function tryGenerateUploadPackage(
  idea: string,
  scenes: Scene[],
  durationSec: number,
  model: string,
  channel: Channel,
): Promise<UploadPackage | null> {
  try {
    const script = scenes.map((s) => formatDialogue(s.dialogue)).join("\n");
    const systemPrompt = buildUploadPackageSystemPrompt(channel.name, channel.description);
    const userPrompt = buildUploadPackageUserPrompt(idea, script, durationSec);
    const result = await generateJsonWithRetry(systemPrompt, userPrompt, model, 300);
    const check = UploadPackageSchema.safeParse(result);
    return check.success ? check.data : null;
  } catch {
    return null;
  }
}
