import { z } from "zod";
import {
  FilePlanSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptComponentsArtifactSchema = z.object({
  components: z.array(SharedRecordSchema).min(1),
  files: z.array(FilePlanSchema).min(1),
});

export type PromptComponentsArtifact = z.infer<
  typeof PromptComponentsArtifactSchema
>;
