import { NextResponse } from "next/server";
import { getChannel, updateChannel, deleteChannel } from "@/lib/channels";
import { deleteCharacterImage } from "@/lib/character-images";
import { getSupabase } from "@/lib/supabase";
import { ChannelUpdateSchema } from "@/lib/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const channel = await getChannel(id);
  if (!channel) {
    return NextResponse.json({ error: "Channel not found." }, { status: 404 });
  }
  return NextResponse.json(channel, { status: 200 });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = ChannelUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  }

  const existing = await getChannel(id);
  if (!existing) {
    return NextResponse.json({ error: "Channel not found." }, { status: 404 });
  }

  const channel = await updateChannel(id, parsed.data);
  return NextResponse.json(channel, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const existing = await getChannel(id);
  if (!existing) {
    return NextResponse.json({ error: "Channel not found." }, { status: 404 });
  }

  // Clean up Storage images before the DB cascade removes the character rows.
  const { data: rows } = await getSupabase()
    .from("characters")
    .select("image_path")
    .eq("channel_id", id);
  await Promise.all(((rows as { image_path: string | null }[]) ?? []).map((r) => deleteCharacterImage(r.image_path)));

  await deleteChannel(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
