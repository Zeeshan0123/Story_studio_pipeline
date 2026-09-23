// Bucket meanings are defined per-channel in its own freeform description
// (see CONTENT BUCKETS in the channel context), not hardcoded here — this
// label is just a generic UI tag, not the actual bucket definition.
export const BUCKET_LABELS: Record<1 | 2 | 3, string> = {
  1: "Bucket 1",
  2: "Bucket 2",
  3: "Bucket 3",
};

export function parseBucket(value: string | null): 1 | 2 | 3 | undefined {
  return value === "1" || value === "2" || value === "3" ? (Number(value) as 1 | 2 | 3) : undefined;
}
