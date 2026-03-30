import { z } from "zod";
import { FilePlanSchema } from "../../shared/schema-primitives";

export const PromptEntryArtifactSchema = z.object({
  entryFiles: z.array(FilePlanSchema).min(1),
  bootstrapNotes: z.array(z.string()).default([]),
});

export type PromptEntryArtifact = z.infer<typeof PromptEntryArtifactSchema>;
