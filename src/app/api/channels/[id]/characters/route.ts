import { NextResponse } from "next/server";
import { getCharacterBible, addCharacter } from "@/lib/character-bible";
import { getChannel } from "@/lib/channels";
import { CharacterInputSchema } from "@/lib/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const channel = await getChannel(id);
  if (!channel) {
    return NextResponse.json({ error: "Channel not found." }, { status: 404 });
  }
  const bible = await getCharacterBible(id);
  return NextResponse.json(bible, { status: 200 });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  const channel = await getChannel(id);
  if (!channel) {
    return NextResponse.json({ error: "Channel not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = CharacterInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  }
  const { name, description } = parsed.data;

  const bible = await getCharacterBible(id);
  const exists = bible.characters.some((c) => c.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    return NextResponse.json({ error: `Character "${name}" already exists.` }, { status: 409 });
  }

  const character = await addCharacter(id, { name, description });
  return NextResponse.json(character, { status: 201 });
}
