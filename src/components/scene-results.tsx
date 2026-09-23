"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SceneCard } from "@/components/scene-card";
import { UploadPackageCard } from "@/components/upload-package-card";
import { CopyButton } from "@/components/copy-button";
import type { GenerateResponse } from "@/types/pipeline";

export function SceneResults({ result }: { result: GenerateResponse }) {
  function handleDownload() {
    const blob = new Blob([result.promptsTxt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompts.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {result.sceneCount} scenes · {result.durationSec}s target · {result.model}
        </p>
        <div className="flex gap-2">
          <CopyButton text={result.promptsTxt} label="Copy all" />
          <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
            Download prompts.txt
          </Button>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <Alert className="border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600">
          <AlertTriangle className="size-4" />
          <AlertTitle>Warnings (non-blocking)</AlertTitle>
          <AlertDescription className="text-amber-700/90 dark:text-amber-400/90">
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {result.scenes.map((scene) => (
          <SceneCard key={scene.id} scene={scene} />
        ))}
      </div>

      {result.uploadPackage ? (
        <UploadPackageCard pkg={result.uploadPackage} />
      ) : (
        <Alert>
          <AlertTitle>No upload details</AlertTitle>
          <AlertDescription>
            Couldn&apos;t generate a title/description/tags for this video — the scenes above are unaffected.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
