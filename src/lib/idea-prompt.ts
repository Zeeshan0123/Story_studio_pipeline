import { buildGenreBlock, type Genre, type Theme } from "./genres";

export const IDEA_COUNT = 10;

// Sampled into the user prompt each call so repeated runs don't converge on
// the same 2-3 go-to situations (water, food waste, etc.) — the model tends
// to default to whichever examples happen to be in its context.
const SITUATION_SEEDS = [
  "grocery store checkout line",
  "neighborhood park or playground",
  "family dinner table",
  "school drop-off or pickup",
  "borrowing something from a neighbor",
  "a friend's birthday party",
  "waiting in a long line",
  "a sports practice or game",
  "cleaning up a shared space",
  "finding a lost item or money",
  "a disagreement over a toy or game",
  "a rainy day stuck indoors",
  "helping an elderly neighbor",
  "a classroom or group project",
  "packing lunch before school",
  "a car ride or road trip",
  "volunteering at a community event",
  "taking care of a pet",
  "a morning routine before school or work",
  "a bedtime routine",
  "losing a game gracefully",
  "forgetting homework or a chore",
  "screen time versus family time",
  "apologizing after a mistake",
  "a new kid at school or in the neighborhood",
];

function sampleSituations(count: number): string[] {
  const pool = [...SITUATION_SEEDS];
  const picked: string[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

export function buildIdeaSystemPrompt(
  channelName: string,
  channelDescription: string,
  genre?: Genre,
  theme?: Theme,
): string {
  return `You are a content strategist generating video ideas for a YouTube \
Shorts / Facebook Reels channel called "${channelName}".

CHANNEL CONTEXT (follow every rule in here exactly):
${channelDescription}

${buildGenreBlock(genre, theme)}TASK:
Generate exactly ${IDEA_COUNT} distinct video ideas, spread across the content \
buckets described above in roughly the proportions given.${genre ? ` Every idea \
must fit the STORY GENRE above.` : ""} No two ideas may \
cover the same lesson or the same story beat. Vary the everyday situation \
each idea is set in — do not default to the same one or two go-to examples \
(e.g. don't make multiple ideas about drinking water or wasting food unless \
the user prompt specifically nudges you that way).

Keep every field short — this must fit a strict output length, so do not \
pad any field with extra description.

For each idea, return:
- title: the hook — a bold claim or question, usable as-is as the video's \
opening line. 12 words or fewer. It must be immediately clear on its own, \
with no vague pronouns or references that only make sense with context a \
viewer doesn't have yet — a stranger should understand exactly what it's \
about from this line alone.
- bucket: 1, 2, or 3, matching the numbered buckets in the channel context
- storySummary: one short sentence (15 words or fewer) describing what the \
cast visibly does in the video
- lesson: one short sentence (15 words or fewer) stating the lesson or takeaway

OUTPUT FORMAT:
Return STRICT JSON ONLY. No markdown, no code fences, no commentary, no \
text before or after the JSON. The JSON must have exactly this shape:
{
  "ideas": [
    {
      "title": string,
      "bucket": 1 | 2 | 3,
      "storySummary": string,
      "lesson": string
    }
  ]
}
`;
}

export function buildIdeaUserPrompt(): string {
  const situations = sampleSituations(8);
  return `Generate ${IDEA_COUNT} video ideas now, following all rules from the \
system prompt. Return JSON only.

For variety, draw inspiration from a mix of these everyday situations \
(you're not limited to them, but don't just reuse the same 1-2 examples \
across every idea): ${situations.join(", ")}.`;
}
