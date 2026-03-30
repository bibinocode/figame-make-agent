import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptPagesArtifactSchema = z.object({
  pages: z.array(SharedRecordSchema).min(1),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptPagesArtifact = z.infer<typeof PromptPagesArtifactSchema>;
