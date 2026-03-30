import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptHooksArtifactSchema = z.object({
  hooks: z.array(SharedRecordSchema).default([]),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptHooksArtifact = z.infer<typeof PromptHooksArtifactSchema>;
