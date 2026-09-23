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
import type { Channel } from "@/types/pipeline";

function ChannelFormBody({
  channel,
  onCancel,
  onSaved,
}: {
  channel: Channel | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEdit = channel != null;
  const [name, setName] = useState(channel?.name ?? "");
  const [description, setDescription] = useState(channel?.description ?? "");
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
      const res = await fetch(isEdit ? `/api/channels/${channel!.id}` : "/api/channels", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed.");
      }
      toast.success(isEdit ? "Channel updated" : "Channel created");
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
        <DialogTitle>{isEdit ? `Edit ${channel.name}` : "New channel"}</DialogTitle>
        <DialogDescription>
          The description is freeform — paste your channel&apos;s full brief (audience, tone, content rules).
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="channel-name">Name</Label>
          <Input id="channel-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="channel-description">Description</Label>
          <Textarea
            id="channel-description"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="font-mono text-xs"
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

export function ChannelFormDialog({
  open,
  onOpenChange,
  channel,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel | null;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <ChannelFormBody
            key={channel?.id ?? "__new__"}
            channel={channel}
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
