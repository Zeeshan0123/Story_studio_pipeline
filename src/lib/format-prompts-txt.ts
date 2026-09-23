import type { DialogueTurn, Scene } from "@/types/pipeline";

export function formatDialogue(turns: DialogueTurn[]): string {
  return turns.map((t) => `${t.speaker}: ${t.line}`).join("\n");
}

export function buildPromptsTxt(scenes: Scene[]): string {
  const lines: string[] = [];
  for (const s of scenes) {
    lines.push(`=== Scene ${s.id} (${s.durationSec}s) ===`);
    lines.push(`Video prompt: ${s.finalVideoPrompt}`);
    lines.push("Dialogue:");
    lines.push(formatDialogue(s.dialogue));
    lines.push("");
  }
  return lines.join("\n");
}
