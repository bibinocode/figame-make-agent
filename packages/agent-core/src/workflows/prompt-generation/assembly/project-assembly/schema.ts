import { z } from "zod";

export const PromptAssemblyArtifactSchema = z.object({
  files: z
    .array(
      z.object({
        path: z.string(),
        kind: z.string(),
        summary: z.string(),
      }),
    )
    .min(1),
  totalFiles: z.number().int().nonnegative(),
  rootFiles: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
});

export type PromptAssemblyArtifact = z.infer<
  typeof PromptAssemblyArtifactSchema
>;
