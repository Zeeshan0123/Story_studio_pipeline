import Link from "next/link";
import { listChannels, getChannel } from "@/lib/channels";
import { getCharacterBible } from "@/lib/character-bible";
import { CharacterBibleEditor } from "@/components/characters/character-bible-editor";

// Reads from Supabase at request time — must not be statically prerendered,
// or edits made through the UI would only show up after a rebuild.
export const dynamic = "force-dynamic";

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const { channel: channelParam } = await searchParams;
  const channels = await listChannels();
  const activeId = channelParam ?? channels[0]?.id;

  if (!activeId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
        No channels yet.{" "}
        <Link href="/channels" className="underline">
          Create one
        </Link>{" "}
        to start building a character bible.
      </div>
    );
  }

  const channel = await getChannel(activeId);
  if (!channel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
        Channel not found.{" "}
        <Link href="/channels" className="underline">
          Pick another
        </Link>
        .
      </div>
    );
  }

  const bible = await getCharacterBible(activeId);
  return <CharacterBibleEditor initial={bible} channelId={activeId} channelName={channel.name} />;
}
