"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Channel } from "@/types/pipeline";

const NAV_LINKS = [
  { href: "/", label: "Generate" },
  { href: "/ideas", label: "Ideas" },
  { href: "/characters", label: "Characters" },
  { href: "/channels", label: "Channels" },
];

export function SiteNav({ channels }: { channels: Channel[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channel") ?? channels[0]?.id ?? "";

  function withChannel(href: string): string {
    if (!channelId) return href;
    const params = new URLSearchParams();
    params.set("channel", channelId);
    return `${href}?${params.toString()}`;
  }

  function handleChannelChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("channel", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={withChannel(link.href)}
          className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
      {channels.length > 0 ? (
        <Select value={channelId} onValueChange={handleChannelChange}>
          <SelectTrigger size="sm" className="ml-1 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {channels.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Link href="/channels" className="rounded-md px-3 py-1.5 text-xs text-muted-foreground underline">
          Create a channel
        </Link>
      )}
    </nav>
  );
}
