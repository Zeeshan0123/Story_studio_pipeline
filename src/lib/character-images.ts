import "server-only";
import { getSupabase, CHARACTER_IMAGES_BUCKET } from "./supabase";

function extensionFor(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/webp") return "webp";
  return "png";
}

export async function uploadCharacterImage(
  channelId: string,
  characterId: string,
  file: File,
): Promise<string> {
  const ext = extensionFor(file.type);
  const path = `${channelId}/${characterId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await getSupabase()
    .storage.from(CHARACTER_IMAGES_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (error) throw new Error(`Failed to upload image: ${error.message}`);

  return path;
}

export function publicImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  const { data } = getSupabase().storage.from(CHARACTER_IMAGES_BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
}

export async function deleteCharacterImage(imagePath: string | null): Promise<void> {
  if (!imagePath) return;
  await getSupabase().storage.from(CHARACTER_IMAGES_BUCKET).remove([imagePath]);
}
