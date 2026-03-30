import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptStylesArtifactSchema = z.object({
  styleTokens: z.array(SharedRecordSchema).default([]),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptStylesArtifact = z.infer<typeof PromptStylesArtifactSchema>;
