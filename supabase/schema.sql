-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Creates the channels/characters tables, the character-images storage
-- bucket, and seeds the existing "Little Deeds" channel + its 4 characters
-- (verbatim from web/data/channel-profile.json and character-bible.json).
-- Reference images are NOT uploaded by this script — run
-- `node scripts/migrate-character-images.mjs` afterwards for those.

create extension if not exists pgcrypto;

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  style_block text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  name text not null,
  description text not null,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists characters_channel_id_idx on characters(channel_id);

-- Public-read bucket for character reference images. Uploads/deletes only
-- ever happen server-side via the service role key, which bypasses storage
-- policies entirely, so no RLS policies are required here.
insert into storage.buckets (id, name, public)
values ('character-images', 'character-images', true)
on conflict (id) do nothing;

-- Seed: the existing single channel, so nothing changes for it after migrating.
with new_channel as (
  insert into channels (name, description, style_block)
  values (
    'Little Deeds',
    $desc$WHAT THE CHANNEL IS:
"Little Deeds" is a YouTube Shorts + Facebook Reels channel of short (30-60 second) 3D animated cartoon videos in English for a US audience. Theme: small good deeds, habits, and values that make life better - for everyone. The channel is about shared humanity: kindness, honesty, gratitude, patience, good habits. Some videos are rooted in Islamic teachings; many are universal life lessons with no religious framing. Brand thesis: small consistent deeds change lives.

AUDIENCE:
Everyone - Muslims and non-Muslims equally. Primary viewers: US adults (20-45) and families watching together. Content must ALWAYS be understandable and enjoyable with zero prior knowledge of Islam: any Islamic term used must be instantly clear from context or briefly translated (e.g. "Bismillah - in the name of God"). Tone: warm, sincere, conversational American English. Never preachy, never lecturing, never guilt-based, never "us vs them." Islam is presented as lived beauty, not argument.

RECURRING CAST (all videos use these characters):
- Yousef: 26-year-old Muslim man, main character/protagonist
- Maryam: his wife, 24
- Adam: their 6-year-old son
- Dada Jan: Yousef's father, 60, wise and gentle
A visibly Muslim American family - the representation IS the message. Settings: everyday home life, neighborhood, grocery store, park, work, occasionally the masjid.

CONTENT BUCKETS (generate ideas across all three):
1. LITTLE LIFE LESSONS (~40%): universal good habits, manners, and values with NO religious claims - honesty, keeping promises, patience with strangers, not wasting food, health habits, small acts of kindness. The lesson works for any viewer of any faith or none. Characters remain naturally Muslim in dress and ambient behavior, but the video never argues religion.
2. WISDOM FOR EVERYONE (~30%): a beautiful teaching FROM Islamic tradition presented as universal human wisdom - e.g. "smiling is charity," "the strongest person is the one who controls their anger." Framed as "here's a beautiful teaching," accessible and inspiring to non-Muslims, sourced authentically for Muslims (citation required: collection + number).
3. SUNNAH HABITS (~30%): daily-life practices of the Prophet framed as practical, often science-backed habits - how to eat, drink, sleep, greet. Explicitly Islamic but explained so a non-Muslim finds it interesting rather than excluded. Citation required.

EVERY IDEA MUST:
- Work for a viewer who knows nothing about Islam (no unexplained jargon, no assumed beliefs)
- Be expressible in ONE simple visual story with the cast (one location preferred, minimal complex motion - clips are AI-generated)
- Fit 30-60 seconds, one single idea per video
- Open with a hook (bold claim or question), end with a comment-inviting CTA that anyone can answer
- Be evergreen (no news, trends, or dated references)

HARD RULES - NEVER GENERATE IDEAS THAT:
- Involve fiqh disputes, sect debates, politics, or comparing/critiquing other religions
- Frame non-Muslims negatively or position the video as dawah/conversion content
- Require depicting any prophet or companion visually
- Require Quran recitation audio
- Involve unverifiable or weak hadith claims (if unsure, mark citation as "NEEDS VERIFICATION")
- Contain anything not family-friendly, or music-dependent concepts$desc$,
    'Style: warm cinematic realism, soft natural lighting, gentle color grade, modest and family-friendly wardrobe, vertical 9:16 framing, shallow depth of field.'
  )
  returning id
)
insert into characters (channel_id, name, description)
select id, name, description from new_channel, (values
  ('Yousef', 'Yousef: PLACEHOLDER — e.g. a man in his early 30s, short dark beard, wearing a simple grey thobe or casual modest clothing.'),
  ('Maryam', 'Maryam: PLACEHOLDER — e.g. a woman in her late 20s, wearing a modest hijab and abaya in muted tones.'),
  ('Adam', 'Adam: PLACEHOLDER — e.g. a cheerful young boy around 7 years old, wearing a simple t-shirt and shorts.'),
  ('Dada Jan', 'Dada Jan: PLACEHOLDER — e.g. an elderly grandfather figure, white beard, wearing a traditional kurta and prayer cap.')
) as seed(name, description);
