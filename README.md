# Shorts Studio

Next.js UI for generating dialogue-skit scene breakdowns for short-form video,
across multiple **channels** — each with its own profile and character cast,
persisted in Supabase.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

**One-time Supabase setup** (Project > SQL Editor):
1. Run `supabase/schema.sql` — creates the `channels`/`characters` tables, the
   `character-images` storage bucket, and seeds the existing "Little Deeds"
   channel + its 4 characters.
2. Run `node scripts/migrate-character-images.mjs` — uploads the existing
   `public/characters/*.png` files into Storage and links them to the seeded
   characters (SQL can't push binary files, hence the separate script).

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Channel switcher** (top nav) — every page is scoped to the selected
  channel via a `?channel=<id>` query param, consistent with how
  `idea`/`bucket`/`genre`/`theme` already flow between pages.
- `/channels` — create, edit, and delete channels. Deleting a channel cascades
  its entire character bible and their Storage images.
- `/` — enter an idea + duration, get scenes back (each with a copy-ready
  video prompt + dialogue), plus a YouTube/Facebook upload package (title,
  description, tags) generated from the finished script. Copy per-field or
  download `prompts.txt`.
- `/ideas` — edit the selected channel's profile (name + freeform
  description/rules) and generate a batch of 10 video ideas from it. Each
  idea shows its bucket, story summary, and lesson, with a button that jumps
  to `/` with that idea (channel, bucket, genre, theme) pre-filled. Each
  batch samples a random set of everyday situations into the prompt so
  repeated runs don't converge on the same 2-3 go-to ideas.
  - Optional **story genre + theme** picker (`src/lib/genres.ts`) narrows the
    batch toward a specific tone — wholesome genres (Happiness, Love,
    Friendship, Courage, Adventure...) stay in the channel's normal warm
    voice; mature genres (Horror, Mystery/Thriller, Tragedy, Moral Drama)
    explicitly permit suspense/tension/sadness for that generation while
    still enforcing platform-safety (no graphic violence/gore/self-harm) and
    every other hard rule. The selection carries through to `/api/generate`
    too, so scene generation keeps the same tone instead of reverting to
    warm/gentle.
- `/characters` — edit the selected channel's character bible (names,
  descriptions, style block, reference images) that gets injected into every
  video prompt for that channel.

## Notes

- `GROQ_API_KEY` is required; `GROQ_MODEL` optionally overrides the default model.
- The free Groq tier caps output tokens/minute, so every Groq call passes an
  explicit `max_completion_tokens` (see `src/lib/groq.ts`): 900 for scene
  generation, 950 for the 10-idea batch (its prompt also caps each field's
  word count to fit), 300 for the upload package. Raise these if you're on a
  paid tier and want longer output. If the upload-package call fails for any
  reason, generation still succeeds — the scenes are unaffected and the UI
  just shows a "no upload details" notice instead.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never exposed to the client.
  All Supabase access goes through this app's own API routes; nothing calls
  Supabase directly from the browser, so no RLS policies are required.
- No auth — this is still a local personal tool, same as before.
- Character reference images live in Supabase Storage (bucket
  `character-images`), uploaded from `/characters` per character.
