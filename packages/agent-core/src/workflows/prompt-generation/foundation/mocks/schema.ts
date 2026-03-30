import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptMocksArtifactSchema = z.object({
  mockScenarios: z.array(SharedRecordSchema).default([]),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptMocksArtifact = z.infer<typeof PromptMocksArtifactSchema>;
