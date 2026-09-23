import { z } from "zod";

export const GenerateRequestSchema = z.object({
  idea: z.string().trim().min(1, "Idea is required."),
  durationSec: z.number().int().positive(),
  channelId: z.string().trim().min(1, "A channel must be selected."),
  model: z.string().trim().min(1).optional(),
  bucket: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  genreId: z.string().trim().min(1).optional(),
  themeId: z.string().trim().min(1).optional(),
});

export const DialogueTurnSchema = z.object({
  speaker: z.string(),
  line: z.string(),
});

export const RawSceneSchema = z.object({
  id: z.number(),
  duration_sec: z.number(),
  dialogue: z.array(DialogueTurnSchema).min(1),
  video_prompt: z.string(),
});

export const RawLlmResultSchema = z.object({
  scenes: z.array(RawSceneSchema).min(1),
});

export const IdeaSchema = z.object({
  title: z.string(),
  bucket: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  storySummary: z.string(),
  lesson: z.string(),
});

export const GenerateIdeasRequestSchema = z.object({
  channelId: z.string().trim().min(1, "A channel must be selected."),
  model: z.string().trim().min(1).optional(),
  genreId: z.string().trim().min(1).optional(),
  themeId: z.string().trim().min(1).optional(),
});

export const ChannelInputSchema = z.object({
  name: z.string().trim().min(1, "Channel name is required."),
  description: z.string().trim().min(1, "Channel description is required."),
});

export const ChannelUpdateSchema = z.object({
  name: z.string().trim().min(1, "Channel name is required.").optional(),
  description: z.string().trim().min(1, "Channel description is required.").optional(),
});

export const CharacterInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: z.string().trim().min(1, "Description is required."),
});

export const UploadPackageSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).min(1),
});

export const StyleBlockInputSchema = z.object({
  styleBlock: z.string().trim().min(1, "Style block is required."),
});
