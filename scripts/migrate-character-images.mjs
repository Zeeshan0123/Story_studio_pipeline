// One-time script: uploads the existing public/characters/*.png files into
// Supabase Storage for the seeded "Little Deeds" channel, and points each
// character row's image_path at the uploaded file.
//
// Run from web/ after applying supabase/schema.sql:
//   node scripts/migrate-character-images.mjs

import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY must be set in web/.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const IMAGE_MAP = {
  Yousef: "Yousef.png",
  Maryam: "Maryam.png",
  Adam: "Adam_kid.png",
  "Dada Jan": "Dada_Jan.png",
};

async function main() {
  const { data: channel, error: channelError } = await supabase
    .from("channels")
    .select("id")
    .eq("name", "Little Deeds")
    .single();
  if (channelError || !channel) {
    console.error("ERROR: 'Little Deeds' channel not found — run supabase/schema.sql first.");
    console.error(channelError?.message ?? "");
    process.exit(1);
  }

  const { data: characters, error: charError } = await supabase
    .from("characters")
    .select("id, name")
    .eq("channel_id", channel.id);
  if (charError) {
    console.error("ERROR fetching characters:", charError.message);
    process.exit(1);
  }

  for (const character of characters) {
    const filename = IMAGE_MAP[character.name];
    if (!filename) {
      console.log(`Skipping ${character.name} — no local image mapped.`);
      continue;
    }
    const filePath = path.join(rootDir, "public", "characters", filename);
    if (!existsSync(filePath)) {
      console.warn(`WARNING: ${filePath} not found, skipping ${character.name}.`);
      continue;
    }

    const buffer = readFileSync(filePath);
    const storagePath = `${channel.id}/${character.id}.png`;

    const { error: uploadError } = await supabase.storage
      .from("character-images")
      .upload(storagePath, buffer, { contentType: "image/png", upsert: true });
    if (uploadError) {
      console.error(`ERROR uploading ${character.name}:`, uploadError.message);
      continue;
    }

    const { error: updateError } = await supabase
      .from("characters")
      .update({ image_path: storagePath })
      .eq("id", character.id);
    if (updateError) {
      console.error(`ERROR updating ${character.name}:`, updateError.message);
      continue;
    }

    console.log(`Uploaded and linked image for ${character.name}.`);
  }

  console.log("Done.");
}

main();
