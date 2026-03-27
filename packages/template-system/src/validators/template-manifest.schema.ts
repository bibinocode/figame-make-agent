import { z } from "zod";

export const templateManifestSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  runtime: z.literal("sandpack"),
  extends: z.array(z.string().min(1)).default([]),
  entry: z
    .object({
      main: z.string().min(1).optional(),
    })
    .optional(),
  preview: z.object({
    template: z.string().min(1),
    visibleFiles: z.array(z.string().min(1)).min(1),
    activeFile: z.string().min(1),
    externalResources: z.array(z.string().min(1)).default([]),
  }),
});

export type TemplateManifestInput = z.infer<typeof templateManifestSchema>;
