"use client";

import { useState } from "react";
import { Pencil, Trash2, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CharacterEntry } from "@/types/pipeline";

export function CharacterCard({
  character,
  onEdit,
  onDelete,
}: {
  character: CharacterEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = character.imageUrl && !imgError;

  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={character.imageUrl!}
              alt={character.name}
              className="size-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <UserRound className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{character.name}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{character.description}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit ${character.name}`}>
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={`Delete ${character.name}`}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
