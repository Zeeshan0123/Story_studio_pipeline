import "server-only";
import { getSupabase } from "./supabase";
import { getChannel, updateChannel } from "./channels";
import { publicImageUrl, deleteCharacterImage } from "./character-images";
import type { CharacterBible, CharacterEntry } from "@/types/pipeline";

export const CONTINUITY_LINE =
  "Also use the saved last frame of the previous scene as a starting " +
  "reference, together with the character reference image(s) above, so " +
  "the setting, lighting, and pose carry over smoothly from the last shot.";

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface CharacterRow {
  id: string;
  name: string;
  description: string;
  image_path: string | null;
}

function mapCharacter(row: CharacterRow): CharacterEntry {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: publicImageUrl(row.image_path),
  };
}

export async function getCharacterBible(channelId: string): Promise<CharacterBible> {
  const [channel, { data, error }] = await Promise.all([
    getChannel(channelId),
    getSupabase()
      .from("characters")
      .select("id, name, description, image_path")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true }),
  ]);
  if (error) throw new Error(`Failed to list characters: ${error.message}`);
  if (!channel) throw new Error(`Channel not found: ${channelId}`);

  return {
    styleBlock: channel.styleBlock,
    characters: (data as CharacterRow[]).map(mapCharacter),
  };
}

export async function addCharacter(
  channelId: string,
  input: { name: string; description: string },
): Promise<CharacterEntry> {
  const { data, error } = await getSupabase()
    .from("characters")
    .insert({ channel_id: channelId, name: input.name, description: input.description })
    .select("id, name, description, image_path")
    .single();
  if (error) throw new Error(`Failed to add character: ${error.message}`);
  return mapCharacter(data as CharacterRow);
}

async function findCharacterByName(channelId: string, name: string): Promise<CharacterRow | null> {
  const { data, error } = await getSupabase()
    .from("characters")
    .select("id, name, description, image_path")
    .eq("channel_id", channelId)
    .ilike("name", name)
    .maybeSingle();
  if (error) throw new Error(`Failed to look up character: ${error.message}`);
  return data as CharacterRow | null;
}

export async function updateCharacter(
  channelId: string,
  currentName: string,
  input: { name?: string; description?: string },
): Promise<CharacterEntry | null> {
  const existing = await findCharacterByName(channelId, currentName);
  if (!existing) return null;

  const patch: Record<string, string> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;

  const { data, error } = await getSupabase()
    .from("characters")
    .update(patch)
    .eq("id", existing.id)
    .select("id, name, description, image_path")
    .single();
  if (error) throw new Error(`Failed to update character: ${error.message}`);
  return mapCharacter(data as CharacterRow);
}

export async function deleteCharacterByName(channelId: string, name: string): Promise<boolean> {
  const existing = await findCharacterByName(channelId, name);
  if (!existing) return false;

  await deleteCharacterImage(existing.image_path);
  const { error } = await getSupabase().from("characters").delete().eq("id", existing.id);
  if (error) throw new Error(`Failed to delete character: ${error.message}`);
  return true;
}

export async function getCharacterIdByName(channelId: string, name: string): Promise<string | null> {
  const existing = await findCharacterByName(channelId, name);
  return existing?.id ?? null;
}

export async function setCharacterImage(characterId: string, imagePath: string): Promise<void> {
  const { error } = await getSupabase().from("characters").update({ image_path: imagePath }).eq("id", characterId);
  if (error) throw new Error(`Failed to save image reference: ${error.message}`);
}

export async function updateStyleBlock(channelId: string, styleBlock: string): Promise<void> {
  await updateChannel(channelId, { styleBlock });
}

export function injectCharacterBible(
  videoPrompt: string,
  bible: CharacterBible,
  speakerNames: string[] = [],
): string {
  // dialogue.speaker is schema-constrained to a known character name, so the
  // model can't dodge it the way it sometimes dodges naming someone in the
  // freeform video_prompt text (e.g. writing "a gloved hand" instead of
  // naming an abstractly-named character like "The Instruments"). Treat
  // whoever's speaking in this scene as present, even if the prompt never
  // says their name.
  const speakerSet = new Set(speakerNames);
  const matched = bible.characters.filter(
    (c) => speakerSet.has(c.name) || new RegExp(`\\b${escapeRegExp(c.name)}\\b`).test(videoPrompt),
  );
  if (matched.length === 0) {
    return videoPrompt;
  }
  const parts = [
    videoPrompt,
    ...matched.map((c) => c.description),
    bible.styleBlock,
    `Match the attached reference image of ${matched.map((c) => c.name).join(", ")} exactly.`,
  ];
  return parts.join("\n");
}
