import { NextResponse } from "next/server";
import { getCharacterIdByName, setCharacterImage } from "@/lib/character-bible";
import { uploadCharacterImage, publicImageUrl } from "@/lib/character-images";

type Params = { params: Promise<{ id: string; name: string }> };

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request, { params }: Params) {
  const { id, name } = await params;
  const decodedName = decodeURIComponent(name);

  const characterId = await getCharacterIdByName(id, decodedName);
  if (!characterId) {
    return NextResponse.json({ error: `Character "${decodedName}" not found.` }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Request must be multipart/form-data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file field is required." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only PNG, JPEG, or WebP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
  }

  const imagePath = await uploadCharacterImage(id, characterId, file);
  await setCharacterImage(characterId, imagePath);

  return NextResponse.json({ imageUrl: publicImageUrl(imagePath) }, { status: 200 });
}
