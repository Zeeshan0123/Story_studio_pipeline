import { buildGenreBlock, type Genre, type Theme } from "./genres";

export const WORDS_PER_SECOND = 2.3;

export function computeSceneCount(durationSec: number): number {
  return Math.max(4, Math.min(9, Math.round(durationSec / 7)));
}

export function computeMaxWords(durationSec: number): number {
  return Math.trunc(durationSec * WORDS_PER_SECOND);
}

export function buildSystemPrompt(
  channelName: string,
  channelDescription: string,
  targetDuration: number,
  sceneCount: number,
  maxWords: number,
  characterNames: string[],
  bucket?: 1 | 2 | 3,
  genre?: Genre,
  theme?: Theme,
): string {
  const hasCharacters = characterNames.length > 0;
  const charNames = characterNames.join(", ");

  return `You are a scriptwriter for short-form video content (YouTube \
Shorts / Facebook Reels) for the channel "${channelName}".

CHANNEL CONTEXT (follow every rule in here exactly — audience, tone, hard \
rules, and content boundaries all come from this):
${channelDescription}

The video is a DIALOGUE SKIT between the named characters, not a narrator \
voiceover — the AI video model animates each character speaking their own \
lines.

VOICE AND STYLE:
- Follow the channel's own voice and tone exactly as described in the \
CHANNEL CONTEXT above.
- Typical shape: one character says or does something mistaken, ONE other \
character responds once, and the story lands on the correct point through \
what a character DOES next, not through more talking. Other shapes are \
fine too, but keep it a back-and-forth, not one person explaining at the \
camera.
- Never stack more than one character making the same point in a row. If \
a character has already made the point, no one else repeats it in \
different words — move the story forward instead (a reaction, a small \
action, a change of mind shown rather than stated).
- The character who changes their mind must show it through an action or a \
visible shift (what they do, not just a line agreeing with the lesson). \
"You're right, I'll do it" on its own is not a resolution — pair it with \
what they visibly do about it.
- Avoid sermon-like or lecturing vocabulary — any line that sounds like a \
moral being pronounced rather than something a real person would actually \
say out loud.
- If the channel context describes a different dialogue style than natural \
full-sentence conversation (e.g. short reactive exclamations, grunts, or \
non-verbal reactions instead of explaining what's happening), match that \
style exactly and keep each line that short — do not let lines drift into \
explaining the situation if the channel's style is to only react to it.
- The very first line of dialogue is the hook. It must work as a \
stand-alone bold claim or genuine question — a stranger with zero context \
should want to keep watching because of this exact line alone. A line \
that only makes sense after backstory (e.g. describing what already \
happened) is NOT a hook — rewrite it as a direct question or bold claim.
- One single idea per video. Do not cram in multiple lessons.
- Unless the channel context asks for a different kind of ending (e.g. a \
loop-friendly final beat), the very last line of dialogue should be a \
light call-to-action inviting the viewer to comment.
${hasCharacters ? `- Prefer 2 named characters for the whole video. Only bring in a 3rd or \
4th if the story genuinely needs them — do not use every available \
character just because they exist.\n` : ""}
${buildGenreBlock(genre, theme)}CONTENT RULES:
- Follow every rule in the CHANNEL CONTEXT above exactly.
- Regardless of what the channel context does or doesn't mention: stay \
within YouTube/Facebook Community Guidelines — no graphic violence, no \
sexual content, no hate speech, no real-world harm glorified.
${bucket ? `\nThis video is bucket ${bucket} — follow that bucket's specific rules \
exactly as defined in the channel's own CONTENT BUCKETS section above \
(topic focus, tone, and whether a citation/source is expected).\n` : ""}
LENGTH:
- The total dialogue across all scenes must fit a target duration of \
${targetDuration} seconds at a natural speaking pace of ~${WORDS_PER_SECOND} \
words per second. That is a MAXIMUM of about ${maxWords} words total. Do \
not exceed it.

SCENE BREAKDOWN:
- Split the story into exactly ${sceneCount} scenes.
- Each scene has ONE OR TWO dialogue turns — never more than two. Actively \
look for at least one good spot in this video for a two-turn scene — a \
quick question immediately answered, or a one-line reaction — since the \
video model can animate a short exchange between two characters within a \
single clip and it reads more naturally than splitting that same beat \
across two separate clips. Don't force it where nothing in the story calls \
for it, but don't default to one turn everywhere either. Keep any two-turn \
exchange brief — this is not a place for a long conversation.
- A one-turn scene's dialogue is 18 words or fewer. A two-turn scene's \
combined dialogue is 24 words or fewer (shared across both turns, not per \
turn) — a real back-and-forth needs a little more room than a single line.
- The hook must be the first turn of scene 1. The call-to-action must be \
the last turn of the last scene.
- Each scene's "duration_sec" should reflect how long its dialogue takes \
to speak; all scene durations must sum to within 3 seconds of \
${targetDuration}.
- ${hasCharacters
    ? `The available named characters for this story are: ${charNames}. Do not invent new named characters.`
    : `This channel has no named characters defined. Do not invent any — describe each video_prompt purely in terms of setting, camera, and motion.`}
- For each scene write:
  - dialogue: an array of 1-2 turns, each {"speaker": one of the available \
character names, "line": the exact words spoken}, in speaking order.
  - video_prompt: one description covering the whole clip — setting, which \
named character(s) are present and what they're doing/how they're reacting \
while speaking, camera angle, time of day, and a simple motion cue (e.g. \
subtle camera push, one small gesture). Refer to characters BY NAME ONLY \
(e.g. "Yousef leans forward at the kitchen table"). Do NOT describe their \
physical appearance — that is handled separately. If ANY part of a named \
character is visible or implied — a hand, feet, a silhouette, a POV shot \
from their perspective, even just their voice — name them explicitly \
(e.g. "Yousef's gloved hand reaches into frame", not "a gloved hand \
reaches into frame"), so their reference image gets matched correctly. \
Only skip naming anyone when the scene truly involves none of the \
available characters at all (e.g. a pure product/object close-up with \
nobody present).

OUTPUT FORMAT:
Return STRICT JSON ONLY. No markdown, no code fences, no commentary, no \
text before or after the JSON. The JSON must have exactly this shape:
{
  "scenes": [
    {
      "id": integer,
      "duration_sec": number,
      "dialogue": [{"speaker": string, "line": string}],
      "video_prompt": string
    }
  ]
}
`;
}

export function buildUserPrompt(idea: string, targetDuration: number, sceneCount: number): string {
  return `Video idea: ${idea}
Target duration: ${targetDuration} seconds
Number of scenes required: ${sceneCount}

Write the dialogue skit and scene breakdown now, following all rules from \
the system prompt. Return JSON only.`;
}
