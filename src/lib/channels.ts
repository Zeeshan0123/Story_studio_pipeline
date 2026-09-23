import "server-only";
import { getSupabase } from "./supabase";
import type { Channel } from "@/types/pipeline";

interface ChannelRow {
  id: string;
  name: string;
  description: string;
  style_block: string;
  created_at: string;
}

function mapChannel(row: ChannelRow): Channel {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    styleBlock: row.style_block,
    createdAt: row.created_at,
  };
}

export async function listChannels(): Promise<Channel[]> {
  const { data, error } = await getSupabase()
    .from("channels")
    .select("id, name, description, style_block, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to list channels: ${error.message}`);
  return (data as ChannelRow[]).map(mapChannel);
}

export async function getChannel(id: string): Promise<Channel | null> {
  const { data, error } = await getSupabase()
    .from("channels")
    .select("id, name, description, style_block, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch channel: ${error.message}`);
  return data ? mapChannel(data as ChannelRow) : null;
}

export async function createChannel(input: {
  name: string;
  description: string;
  styleBlock?: string;
}): Promise<Channel> {
  const { data, error } = await getSupabase()
    .from("channels")
    .insert({
      name: input.name,
      description: input.description,
      style_block: input.styleBlock ?? "",
    })
    .select("id, name, description, style_block, created_at")
    .single();
  if (error) throw new Error(`Failed to create channel: ${error.message}`);
  return mapChannel(data as ChannelRow);
}

export async function updateChannel(
  id: string,
  input: { name?: string; description?: string; styleBlock?: string },
): Promise<Channel> {
  const patch: Record<string, string> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.styleBlock !== undefined) patch.style_block = input.styleBlock;

  const { data, error } = await getSupabase()
    .from("channels")
    .update(patch)
    .eq("id", id)
    .select("id, name, description, style_block, created_at")
    .single();
  if (error) throw new Error(`Failed to update channel: ${error.message}`);
  return mapChannel(data as ChannelRow);
}

export async function deleteChannel(id: string): Promise<void> {
  const { error } = await getSupabase().from("channels").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete channel: ${error.message}`);
}
