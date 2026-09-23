import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { formatDialogue } from "@/lib/format-prompts-txt";
import type { Scene } from "@/types/pipeline";

export function SceneCard({ scene }: { scene: Scene }) {
  const dialogueText = formatDialogue(scene.dialogue);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Scene {scene.id}</CardTitle>
        <Badge variant="secondary">{scene.durationSec}s</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Video prompt
            </span>
            <CopyButton text={scene.finalVideoPrompt} />
          </div>
          <p className="rounded-md bg-muted/50 p-3 text-sm leading-relaxed whitespace-pre-wrap">
            {scene.finalVideoPrompt}
          </p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dialogue
            </span>
            <CopyButton text={dialogueText} />
          </div>
          <div className="space-y-1 rounded-md bg-muted/50 p-3 text-sm leading-relaxed">
            {scene.dialogue.map((turn, i) => (
              <p key={i}>
                <span className="font-medium">{turn.speaker}:</span> {turn.line}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
