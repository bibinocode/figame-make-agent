import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptTypesArtifactSchema = z.object({
  sharedTypes: z.array(SharedRecordSchema).default([]),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptTypesArtifact = z.infer<typeof PromptTypesArtifactSchema>;
