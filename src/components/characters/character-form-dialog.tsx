"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CharacterEntry } from "@/types/pipeline";

function CharacterFormBody({
  character,
  channelId,
  onCancel,
  onSaved,
}: {
  character: CharacterEntry | null;
  channelId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEdit = character != null;
  const [name, setName] = useState(character?.name ?? "");
  const [description, setDescription] = useState(character?.description ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !description.trim()) {
      setError("Name and description are both required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        isEdit
          ? `/api/channels/${channelId}/characters/${encodeURIComponent(character!.name)}`
          : `/api/channels/${channelId}/characters`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed.");
      }

      if (imageFile) {
        const form = new FormData();
        form.append("file", imageFile);
        const imgRes = await fetch(
          `/api/channels/${channelId}/characters/${encodeURIComponent(data.name)}/image`,
          { method: "POST", body: form },
        );
        if (!imgRes.ok) {
          const imgData = await imgRes.json();
          throw new Error(imgData.error || "Character saved, but the image upload failed.");
        }
      }

      toast.success(isEdit ? "Character updated" : "Character added");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? `Edit ${character.name}` : "Add character"}</DialogTitle>
        <DialogDescription>
          The name is matched by word boundary inside video prompts — stick to letters and spaces.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="char-name">Name</Label>
          <Input id="char-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="char-description">Description</Label>
          <Textarea
            id="char-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="char-image">Reference image {isEdit && "(replace)"}</Label>
          <Input
            id="char-image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function CharacterFormDialog({
  open,
  onOpenChange,
  character,
  channelId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: CharacterEntry | null;
  channelId: string;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <CharacterFormBody
            key={character?.id ?? "__new__"}
            character={character}
            channelId={channelId}
            onCancel={() => onOpenChange(false)}
            onSaved={() => {
              onSaved();
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
