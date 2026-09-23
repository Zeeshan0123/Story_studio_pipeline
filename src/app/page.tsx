import { Suspense } from "react";
import { GenerateForm } from "@/components/generate-form";
import { listChannels } from "@/lib/channels";

// Reads the channel list from Supabase at request time — must not be
// statically prerendered, or a newly created channel wouldn't show up here
// until a rebuild.
export const dynamic = "force-dynamic";

export default async function Home() {
  const defaultModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
  const channels = await listChannels().catch(() => []);
  return (
    <Suspense>
      <GenerateForm defaultModel={defaultModel} channels={channels} />
    </Suspense>
  );
}
