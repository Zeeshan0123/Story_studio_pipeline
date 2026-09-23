import { NextResponse } from "next/server";
import { updateStyleBlock } from "@/lib/character-bible";
import { getChannel } from "@/lib/channels";
import { StyleBlockInputSchema } from "@/lib/schema";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
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

  const parsed = StyleBlockInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  }

  await updateStyleBlock(id, parsed.data.styleBlock);
  return NextResponse.json({ styleBlock: parsed.data.styleBlock }, { status: 200 });
}
