import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptDomainLogicArtifactSchema = z.object({
  flows: z.array(SharedRecordSchema).default([]),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptDomainLogicArtifact = z.infer<
  typeof PromptDomainLogicArtifactSchema
>;
