import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptUtilsArtifactSchema = z.object({
  utilities: z.array(SharedRecordSchema).default([]),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptUtilsArtifact = z.infer<typeof PromptUtilsArtifactSchema>;
