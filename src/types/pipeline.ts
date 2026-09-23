export interface DialogueTurn {
  speaker: string;
  line: string;
}

// Shape returned by the LLM itself (snake_case, matches pipeline.py's system prompt).
export interface RawScene {
  id: number;
  duration_sec: number;
  dialogue: DialogueTurn[];
  video_prompt: string;
}

export interface RawLlmResult {
  scenes: RawScene[];
}

// Shape returned by our /api/generate route (camelCase).
export interface Scene {
  id: number;
  durationSec: number;
  dialogue: DialogueTurn[];
  videoPrompt: string;
  finalVideoPrompt: string;
}

export interface UploadPackage {
  title: string;
  description: string;
  tags: string[];
}

export interface GenerateResponse {
  model: string;
  durationSec: number;
  sceneCount: number;
  warnings: string[];
  scenes: Scene[];
  promptsTxt: string;
  uploadPackage: UploadPackage | null;
}

export interface CharacterEntry {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
}

export interface CharacterBible {
  styleBlock: string;
  characters: CharacterEntry[];
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  styleBlock: string;
  createdAt: string;
}

export interface Idea {
  title: string;
  bucket: 1 | 2 | 3;
  storySummary: string;
  lesson: string;
}

export interface GenerateIdeasResponse {
  ideas: Idea[];
}
