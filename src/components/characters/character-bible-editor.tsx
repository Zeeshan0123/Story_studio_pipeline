"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CharacterCard } from "@/components/characters/character-card";
import { CharacterFormDialog } from "@/components/characters/character-form-dialog";
import type { CharacterBible, CharacterEntry } from "@/types/pipeline";

export function CharacterBibleEditor({
  initial,
  channelId,
  channelName,
}: {
  initial: CharacterBible;
  channelId: string;
  channelName: string;
}) {
  const [styleBlock, setStyleBlock] = useState(initial.styleBlock);
  const [savingStyle, setSavingStyle] = useState(false);
  const [characters, setCharacters] = useState<CharacterEntry[]>(initial.characters);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CharacterEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CharacterEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refreshCharacters() {
    const res = await fetch(`/api/channels/${channelId}/characters`);
    if (res.ok) {
      const data = (await res.json()) as CharacterBible;
      setCharacters(data.characters);
      setStyleBlock(data.styleBlock);
    }
  }

  async function handleSaveStyleBlock() {
    if (!styleBlock.trim()) {
      toast.error("Style block can't be empty.");
      return;
    }
    setSavingStyle(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/style-block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styleBlock: styleBlock.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed.");
      }
      toast.success("Style block saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingStyle(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/characters/${encodeURIComponent(deleteTarget.name)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed.");
      }
      toast.success(`Deleted ${deleteTarget.name}`);
      await refreshCharacters();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Character bible — {channelName}</h1>
        <p className="text-sm text-muted-foreground">
          Edited here, injected automatically into every generated video prompt.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Style block</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={3}
            value={styleBlock}
            onChange={(e) => setStyleBlock(e.target.value)}
          />
          <Button type="button" size="sm" onClick={handleSaveStyleBlock} disabled={savingStyle}>
            {savingStyle ? "Saving…" : "Save style block"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Characters</h2>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add character
          </Button>
        </div>

        <div className="space-y-3">
          {characters.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              onEdit={() => {
                setEditing(c);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      </div>

      <CharacterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        character={editing}
        channelId={channelId}
        onSaved={refreshCharacters}
      />

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it (and its reference image) from the character bible. Existing generated
              scenes referencing this character won&apos;t be affected, but future ones won&apos;t
              match it to a reference image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
