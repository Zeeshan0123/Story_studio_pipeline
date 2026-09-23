import { NextResponse } from "next/server";
import { listChannels, createChannel } from "@/lib/channels";
import { ChannelInputSchema } from "@/lib/schema";

export async function GET() {
  const channels = await listChannels();
  return NextResponse.json({ channels }, { status: 200 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = ChannelInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  }

  const channel = await createChannel(parsed.data);
  return NextResponse.json(channel, { status: 201 });
}
