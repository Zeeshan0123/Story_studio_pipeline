export type Tone = "wholesome" | "mature";

export interface Theme {
  id: string;
  name: string;
  description: string;
}

export interface Genre {
  id: string;
  name: string;
  tone: Tone;
  description: string;
  themes: Theme[];
}

function theme(id: string, name: string, description: string): Theme {
  return { id, name, description };
}

export const GENRES: Genre[] = [
  {
    id: "life-lessons",
    name: "Little Life Lessons",
    tone: "wholesome",
    description: "Everyday good habits and values, told simply.",
    themes: [
      theme("honesty", "Honesty in Small Moments", "A small, easy-to-hide untruth and the pull to come clean anyway."),
      theme("patience", "Patience with Others", "Staying calm and kind when someone is difficult or slow."),
      theme("keeping-word", "Keeping Your Word", "A promise that becomes inconvenient to keep."),
      theme("not-wasting", "Not Wasting What You Have", "Noticing and correcting a small everyday waste."),
      theme("kindness-strangers", "Kindness to Strangers", "A small act of kindness toward someone you don't know."),
    ],
  },
  {
    id: "happiness",
    name: "Happiness & Gratitude",
    tone: "wholesome",
    description: "Finding contentment and joy in ordinary life.",
    themes: [
      theme("small-joy", "Small Moments of Joy", "Noticing happiness in something easy to overlook."),
      theme("gratitude-hard-times", "Gratitude in Hard Times", "Finding something to be thankful for during a rough day."),
      theme("contentment", "Contentment Over Comparison", "Choosing to be satisfied instead of envying someone else."),
      theme("celebrating-others", "Celebrating Someone Else's Win", "Being genuinely happy for another person's success."),
      theme("routine-light", "Finding Light in a Routine Day", "An ordinary chore or routine turns into something meaningful."),
    ],
  },
  {
    id: "love-family",
    name: "Love & Family",
    tone: "wholesome",
    description: "The quiet, everyday shape of family love.",
    themes: [
      theme("unconditional-love", "Unconditional Family Love", "Love that doesn't depend on someone getting it right."),
      theme("quiet-sacrifice", "Quiet Sacrifice", "A small sacrifice a family member makes without asking for credit."),
      theme("patience-marriage", "Patience in Marriage", "A small friction between partners resolved with grace."),
      theme("generational-wisdom", "Generational Wisdom", "An older family member's advice lands differently than expected."),
      theme("love-in-action", "Love Shown Through Actions", "Love expressed by doing something, not saying it."),
    ],
  },
  {
    id: "friendship",
    name: "Friendship & Community",
    tone: "wholesome",
    description: "Showing up for the people around you.",
    themes: [
      theme("showing-up", "Showing Up for Others", "Being there for someone at an inconvenient time."),
      theme("including-outsider", "Including the Outsider", "Noticing someone left out and bringing them in."),
      theme("forgiving-friend", "Forgiving a Friend", "Letting go of a small hurt to keep a friendship intact."),
      theme("loyalty", "Loyalty Under Pressure", "Standing by someone when it would be easier not to."),
      theme("small-favor", "The Power of a Small Favor", "A tiny favor that means more than expected."),
    ],
  },
  {
    id: "courage",
    name: "Courage & Growth",
    tone: "wholesome",
    description: "Small acts of bravery and self-improvement.",
    themes: [
      theme("facing-fear", "Facing a Fear", "A small, everyday fear confronted and overcome."),
      theme("admitting-wrong", "Admitting You're Wrong", "The discomfort and relief of owning a mistake."),
      theme("trying-again", "Trying Again After Failure", "Getting back up after an embarrassing failure."),
      theme("standing-up", "Standing Up for What's Right", "Speaking up in a small moment that takes courage."),
      theme("comfort-zone", "Leaving Your Comfort Zone", "Doing something new and uncomfortable on purpose."),
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment & Fun",
    tone: "wholesome",
    description: "Light, funny, feel-good moments.",
    themes: [
      theme("harmless-prank", "A Harmless Prank", "A playful prank that goes slightly sideways."),
      theme("friendly-competition", "Friendly Competition", "A lighthearted contest between the cast."),
      theme("joy-of-play", "The Joy of Play", "Simple, silly fun for its own sake."),
      theme("misunderstanding", "A Silly Misunderstanding", "A small mix-up that resolves into a laugh."),
      theme("unexpected-talent", "Unexpected Talent", "Someone reveals a surprising hidden skill."),
    ],
  },
  {
    id: "adventure",
    name: "Adventure & Discovery",
    tone: "wholesome",
    description: "Small journeys that teach something bigger.",
    themes: [
      theme("small-journey", "A Small Journey, Big Lesson", "A short trip or errand that becomes meaningful."),
      theme("curiosity-rewarded", "Curiosity Rewarded", "Asking a question leads somewhere unexpected."),
      theme("lost-purpose", "Getting Lost, Finding Purpose", "Being lost or off-track leads to clarity."),
      theme("unexpected-guide", "The Unexpected Guide", "An unlikely person offers guidance."),
      theme("new-perspective", "A New Place, New Perspective", "A new environment shifts how a character sees things."),
    ],
  },
  {
    id: "horror",
    name: "Horror & Suspense",
    tone: "mature",
    description: "Tense, moody, psychologically unsettling — atmosphere and implication, never graphic.",
    themes: [
      theme("illusion-of-control", "The Illusion of Control", "A character realizes how little control they actually had."),
      theme("grief-trauma", "Grief and Trauma", "The lingering emotional weight of a past loss, handled with care."),
      theme("monster-within", "The Monster Within", "An inner temptation or flaw personified as something to resist."),
      theme("fear-of-other", "Fear of the Other", "Misplaced suspicion of someone unfamiliar, and what it costs."),
      theme("survival-morality", "Survival vs Morality", "A hard choice between self-preservation and doing right."),
      theme("lurks-in-silence", "What Lurks in Silence", "Unease built through quiet and what's left unsaid."),
      theme("price-of-secret", "The Price of a Secret", "A hidden truth that grows heavier the longer it's kept."),
    ],
  },
  {
    id: "mystery",
    name: "Mystery & Thriller",
    tone: "mature",
    description: "Tension and suspense built through withheld information.",
    themes: [
      theme("unreliable-narrator", "The Unreliable Narrator", "A character's version of events isn't quite the full truth."),
      theme("secret-buried", "A Secret Long Buried", "An old secret resurfaces and has to be dealt with."),
      theme("trust-no-one", "Trust No One", "A character can't tell who's being honest with them."),
      theme("racing-time", "Racing Against Time", "A tense deadline drives the story."),
      theme("the-setup", "The Setup", "A character realizes they've been maneuvered into something."),
    ],
  },
  {
    id: "tragedy",
    name: "Tragedy & Loss",
    tone: "mature",
    description: "Emotional weight, sadness, and quiet grief — handled with care, never bleak for its own sake.",
    themes: [
      theme("weight-of-regret", "The Weight of Regret", "Living with a choice that can't be undone."),
      theme("goodbye-too-soon", "A Goodbye Too Soon", "An ending that comes before it feels ready."),
      theme("what-we-dont-say", "What We Don't Say", "Words left unspoken until it's too late to say them easily."),
      theme("cost-of-pride", "The Cost of Pride", "Pride gets in the way of something that mattered more."),
      theme("letting-go", "Letting Go", "Accepting something that can't be changed."),
    ],
  },
  {
    id: "moral-drama",
    name: "Moral Drama",
    tone: "mature",
    description: "Difficult choices with no clean answer.",
    themes: [
      theme("right-vs-right", "Right vs Right", "Two good values in direct conflict with each other."),
      theme("lesser-of-two-evils", "The Lesser of Two Evils", "Every available option costs something."),
      theme("loyalty-vs-truth", "When Loyalty and Truth Collide", "Telling the truth means hurting someone you're loyal to."),
      theme("line-you-wont-cross", "The Line You Won't Cross", "A character is pressured toward something they refuse to do."),
      theme("no-good-option", "A Choice With No Good Option", "Every path forward has a real cost."),
    ],
  },
];

export function buildGenreBlock(genre?: Genre, theme?: Theme): string {
  if (!genre || !theme) return "";

  if (genre.tone === "wholesome") {
    return `STORY GENRE: ${genre.name} — "${theme.name}"
${theme.description}
Stay within the channel's normal warm, gentle tone described above while \
telling this specific kind of story.

`;
  }

  return `STORY GENRE OVERRIDE: ${genre.name} — "${theme.name}"
${theme.description}
- For THIS story only, it's OK to depart from the channel's usual warm/gentle \
tone: lean into suspense, tension, sadness, or moral weight as the theme calls for.
- The theme must shape the STORY ITSELF, not just the lighting. Build it \
around one concrete symbol, image, or recurring device that embodies "${theme.name}" \
— the way an inner temptation could be shown as a literal shadow that grows \
or shrinks, or regret as a physical weight a character carries. Invent that \
device and carry it consistently through every scene's video_prompt. Moodier \
lighting on an otherwise ordinary story is NOT enough — if you can't point \
to a specific image or device that only makes sense because of this theme, \
you haven't used it yet.
- Still platform-safe: NO graphic violence, gore, blood, weapons used \
on-screen, self-harm, or anything that would violate YouTube/Facebook \
community guidelines. Build tension through atmosphere, pacing, and what's \
implied — never through graphic depiction.
- Still family-viewable: nothing sexual, no real-world hate, no glorifying harm.
- Every other hard rule above still applies unconditionally: never depict a \
prophet/companion, no fiqh disputes/sect debates/politics, never invent or \
misattribute a teaching.

`;
}

export function findGenre(id: string | null | undefined): Genre | undefined {
  return GENRES.find((g) => g.id === id);
}

export function findTheme(genreId: string | null | undefined, themeId: string | null | undefined): Theme | undefined {
  return findGenre(genreId ?? undefined)?.themes.find((t) => t.id === themeId);
}

export function parseGenreParams(searchParams: URLSearchParams): { genre?: Genre; theme?: Theme } {
  const genreId = searchParams.get("genre");
  const themeId = searchParams.get("theme");
  const genre = findGenre(genreId);
  const theme = genre ? findTheme(genreId, themeId) : undefined;
  return { genre, theme };
}
