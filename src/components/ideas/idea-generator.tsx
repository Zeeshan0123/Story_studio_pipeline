"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lightbulb, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IdeaCard } from "@/components/ideas/idea-card";
import { GENRES, findGenre } from "@/lib/genres";
import type { Channel, Idea } from "@/types/pipeline";

const ANY = "any";

export function IdeaGenerator({ initial }: { initial: Channel }) {
  const channelId = initial.id;
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [savingProfile, setSavingProfile] = useState(false);

  const [genreId, setGenreId] = useState(ANY);
  const [themeId, setThemeId] = useState(ANY);
  const selectedGenre = findGenre(genreId === ANY ? undefined : genreId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[] | null>(null);

  function handleGenreChange(value: string | null) {
    setGenreId(value ?? ANY);
    setThemeId(ANY);
  }

  async function saveProfile(): Promise<boolean> {
    if (!name.trim() || !description.trim()) {
      toast.error("Channel name and description can't be empty.");
      return false;
    }
    const res = await fetch(`/api/channels/${channelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Save failed.");
    }
    return true;
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      if (await saveProfile()) {
        toast.success("Channel profile saved");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setIdeas(null);
    try {
      // Always save first — otherwise edited-but-unsaved profile text would
      // be silently ignored in favor of the last persisted version.
      if (!(await saveProfile())) {
        return;
      }
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          genreId: genreId === ANY ? undefined : genreId,
          themeId: themeId === ANY ? undefined : themeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Idea generation failed.");
      }
      setIdeas(data.ideas as Idea[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Generate video ideas</h1>
        <p className="text-sm text-muted-foreground">
          Describe your channel once, then generate a batch of ideas whenever you need them.
        </p>
      </div>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base">Channel profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel name</Label>
            <Input id="channel-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel-description">Channel description</Label>
            <Textarea
              id="channel-description"
              rows={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save as default"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base">Story genre (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select value={genreId} onValueChange={handleGenreChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any (let the channel decide)</SelectItem>
                  {GENRES.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                      {g.tone === "mature" ? " (mature)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={themeId}
                onValueChange={(value) => setThemeId(value ?? ANY)}
                disabled={!selectedGenre}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any</SelectItem>
                  {selectedGenre?.themes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedGenre?.tone === "mature" && (
            <Alert className="border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600">
              <TriangleAlert className="size-4" />
              <AlertDescription className="text-amber-700/90 dark:text-amber-400/90">
                This departs from the channel&apos;s usual warm, gentle tone — review before publishing.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="mx-auto w-full max-w-3xl">
        <Button type="button" size="sm" className="w-full gap-2" onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Lightbulb className="size-4" />}
          {loading ? "Generating…" : "Generate 10 ideas"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mx-auto w-full max-w-3xl">
          <AlertTitle>Idea generation failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      )}

      {ideas && !loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {ideas.map((idea, i) => (
            <IdeaCard
              key={i}
              idea={idea}
              channelId={channelId}
              genreId={genreId === ANY ? undefined : genreId}
              themeId={themeId === ANY ? undefined : themeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
