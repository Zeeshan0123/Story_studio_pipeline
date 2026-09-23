import { NextResponse } from "next/server";
import { getCharacterBible, updateCharacter, deleteCharacterByName } from "@/lib/character-bible";
import { CharacterInputSchema } from "@/lib/schema";

type Params = { params: Promise<{ id: string; name: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id, name } = await params;
  const decodedCurrentName = decodeURIComponent(name);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = CharacterInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  }

  const nextName = parsed.data.name?.trim();
  if (nextName && nextName.toLowerCase() !== decodedCurrentName.toLowerCase()) {
    const bible = await getCharacterBible(id);
    const nameTaken = bible.characters.some(
      (c) => c.name.toLowerCase() === nextName.toLowerCase() && c.name.toLowerCase() !== decodedCurrentName.toLowerCase(),
    );
    if (nameTaken) {
      return NextResponse.json({ error: `Character "${nextName}" already exists.` }, { status: 409 });
    }
  }

  const updated = await updateCharacter(id, decodedCurrentName, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: `Character "${decodedCurrentName}" not found.` }, { status: 404 });
  }
  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id, name } = await params;
  const decodedName = decodeURIComponent(name);

  const deleted = await deleteCharacterByName(id, decodedName);
  if (!deleted) {
    return NextResponse.json({ error: `Character "${decodedName}" not found.` }, { status: 404 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
