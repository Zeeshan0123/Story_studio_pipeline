"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SceneResults } from "@/components/scene-results";
import { BUCKET_LABELS, parseBucket } from "@/lib/buckets";
import { parseGenreParams } from "@/lib/genres";
import type { Channel, GenerateResponse } from "@/types/pipeline";

const MIN_DURATION = 15;
const MAX_DURATION = 90;
const IDEA_MAX_LENGTH = 500;

export function GenerateForm({ defaultModel, channels }: { defaultModel: string; channels: Channel[] }) {
  const searchParams = useSearchParams();
  const [idea, setIdea] = useState(() => searchParams.get("idea") ?? "");
  const bucket = parseBucket(searchParams.get("bucket"));
  const { genre, theme } = parseGenreParams(searchParams);
  const channelId = searchParams.get("channel") ?? channels[0]?.id;
  const activeChannel = channels.find((c) => c.id === channelId);
  const [durationSec, setDurationSec] = useState(45);
  const [model, setModel] = useState(defaultModel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!idea.trim() || !channelId || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          durationSec,
          channelId,
          model,
          bucket,
          genreId: genre?.id,
          themeId: theme?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }
      setResult(data as GenerateResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!channelId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
        No channels yet.{" "}
        <a href="/channels" className="underline">
          Create one
        </a>{" "}
        before generating a video.
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Generate a scene breakdown</h1>
        <p className="text-sm text-muted-foreground">
          One idea in, a dialogue-skit script and per-scene video prompts out.
          {activeChannel && <> Channel: <span className="font-medium text-foreground">{activeChannel.name}</span>.</>}
        </p>
      </div>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base">New video</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="idea">Video idea</Label>
                <div className="flex gap-1.5">
                  {bucket && <Badge variant="secondary">{BUCKET_LABELS[bucket]}</Badge>}
                  {genre && (
                    <Badge variant={genre.tone === "mature" ? "destructive" : "secondary"}>
                      {genre.name}
                      {theme ? ` · ${theme.name}` : ""}
                    </Badge>
                  )}
                </div>
              </div>
              <Textarea
                id="idea"
                placeholder="e.g. the sunnah of drinking water while sitting"
                value={idea}
                maxLength={IDEA_MAX_LENGTH}
                onChange={(e) => setIdea(e.target.value)}
                rows={3}
                required
              />
              <p className="text-right text-xs text-muted-foreground">
                {idea.length}/{IDEA_MAX_LENGTH}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="duration">Target duration</Label>
                <span className="text-sm text-muted-foreground">{durationSec}s</span>
              </div>
              <Slider
                id="duration"
                min={MIN_DURATION}
                max={MAX_DURATION}
                step={5}
                value={[durationSec]}
                onValueChange={(v) => setDurationSec(Array.isArray(v) ? v[0] : v)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>

            <Button type="submit" disabled={loading || !idea.trim()} className="w-full gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              {loading ? "Generating…" : "Generate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mx-auto w-full max-w-3xl">
          <AlertTitle>Generation failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      )}

      {result && !loading && <SceneResults result={result} />}
    </div>
  );
}
