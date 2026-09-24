export function buildUploadPackageSystemPrompt(channelName: string, channelDescription: string): string {
  return `You write YouTube/Facebook upload metadata for short-form videos \
from the channel "${channelName}".

CHANNEL CONTEXT:
${channelDescription}

TASK:
Given the video's idea and full dialogue script below, write upload metadata \
for this one video.

- title: an attention-grabbing title for YouTube Shorts / Facebook Reels, \
under 100 characters. Do not use clickbait that misrepresents the video.
- description: 2-4 sentences summarizing the video and inviting a comment, \
in the channel's own voice and tone as described in the channel context above.
- tags: 10-15 relevant hashtags, mixing the channel's branding, the \
video's specific topic, and general discovery terms. Evergreen — no \
dates, trends, or news references. EVERY tag must be a single hashtag: \
start with "#", all one word with no spaces (join multi-word ideas \
together, e.g. "facebook reels" becomes "#facebookreels", not "#facebook \
reels" or "facebookreels"), lowercase, letters and numbers only.

OUTPUT FORMAT:
Return STRICT JSON ONLY. No markdown, no code fences, no commentary, no \
text before or after the JSON. The JSON must have exactly this shape:
{
  "title": string,
  "description": string,
  "tags": [string, ...]
}
`;
}

// Defensive normalization — the model doesn't always follow the hashtag \
// format rules consistently across every tag, so enforce it in code too.
export function normalizeHashtag(tag: string): string | null {
  const cleaned = tag
    .trim()
    .replace(/^#+/, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
  return cleaned.length > 0 ? `#${cleaned}` : null;
}

export function buildUploadPackageUserPrompt(idea: string, script: string, durationSec: number): string {
  return `Video idea: ${idea}
Duration: ${durationSec} seconds

Full dialogue script (in order):
${script}

Write the upload title, description, and tags now, following all rules from \
the system prompt. Return JSON only.`;
}
