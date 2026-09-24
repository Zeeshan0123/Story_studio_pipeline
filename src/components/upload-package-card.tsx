import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import type { UploadPackage } from "@/types/pipeline";

export function UploadPackageCard({ pkg }: { pkg: UploadPackage }) {
  const tagsJoined = pkg.tags.join(" ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</span>
            <CopyButton text={pkg.title} />
          </div>
          <p className="rounded-md bg-muted/50 p-3 text-sm leading-relaxed">{pkg.title}</p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </span>
            <CopyButton text={pkg.description} />
          </div>
          <p className="rounded-md bg-muted/50 p-3 text-sm leading-relaxed whitespace-pre-wrap">
            {pkg.description}
          </p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tags</span>
            <CopyButton text={tagsJoined} label="Copy tags" />
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-md bg-muted/50 p-3">
            {pkg.tags.map((tag, i) => (
              <Badge key={i} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
