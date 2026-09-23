import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { BUCKET_LABELS } from "@/lib/buckets";
import type { Idea } from "@/types/pipeline";

export function IdeaCard({
  idea,
  channelId,
  genreId,
  themeId,
}: {
  idea: Idea;
  channelId: string;
  genreId?: string;
  themeId?: string;
}) {
  const params = new URLSearchParams({
    idea: idea.title,
    bucket: String(idea.bucket),
    channel: channelId,
  });
  if (genreId) params.set("genre", genreId);
  if (themeId) params.set("theme", themeId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="text-base leading-snug">{idea.title}</CardTitle>
        <Badge variant="secondary" className="shrink-0">
          {BUCKET_LABELS[idea.bucket]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{idea.storySummary}</p>
        <p className="text-sm">
          <span className="font-medium">Lesson: </span>
          {idea.lesson}
        </p>
        <div className="flex items-center justify-between pt-1">
          <CopyButton text={idea.title} label="Copy title" />
          <Button size="sm" variant="outline" className="gap-1.5" render={<Link href={`/?${params.toString()}`} />}>
            Use this idea
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
