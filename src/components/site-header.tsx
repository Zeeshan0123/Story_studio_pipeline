import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteNav } from "@/components/site-nav";
import { listChannels } from "@/lib/channels";

export async function SiteHeader() {
  const channels = await listChannels().catch(() => []);

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          Shorts Studio
        </Link>
        <div className="flex items-center gap-1">
          <Suspense>
            <SiteNav channels={channels} />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
