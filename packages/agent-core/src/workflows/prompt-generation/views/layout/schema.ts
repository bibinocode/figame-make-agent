import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptLayoutArtifactSchema = z.object({
  layouts: z.array(SharedRecordSchema).default([]),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptLayoutArtifact = z.infer<typeof PromptLayoutArtifactSchema>;
