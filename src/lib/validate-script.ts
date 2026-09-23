import { computeMaxWords, WORDS_PER_SECOND } from "./prompt-builder";
import type { RawScene } from "@/types/pipeline";

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function validateScript(result: { scenes: RawScene[] }, targetDuration: number): string[] {
  const warnings: string[] = [];
  const { scenes } = result;

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration_sec, 0);
  if (Math.abs(totalDuration - targetDuration) > 3) {
    const diff = totalDuration - targetDuration;
    const sign = diff >= 0 ? "+" : "";
    warnings.push(
      `Scene durations sum to ${totalDuration}s, target was ${targetDuration}s (diff ${sign}${diff.toFixed(1)}s).`,
    );
  }

  let totalWords = 0;
  for (const s of scenes) {
    if (s.dialogue.length > 2) {
      warnings.push(`Scene ${s.id} has ${s.dialogue.length} dialogue turns (max 2).`);
    }
    const sceneWords = s.dialogue.reduce((sum, turn) => sum + wordCount(turn.line), 0);
    totalWords += sceneWords;
    const sceneMaxWords = s.dialogue.length >= 2 ? 24 : 18;
    if (sceneWords > sceneMaxWords) {
      warnings.push(
        `Scene ${s.id} dialogue has ${sceneWords} words across its turns (max ${sceneMaxWords}).`,
      );
    }
  }

  const maxWords = computeMaxWords(targetDuration);
  if (totalWords > maxWords) {
    warnings.push(
      `Total dialogue is ${totalWords} words, exceeds ~${maxWords} word budget for ${targetDuration}s at ${WORDS_PER_SECOND} wps.`,
    );
  }

  return warnings;
}
