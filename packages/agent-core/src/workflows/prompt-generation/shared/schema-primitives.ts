import { z } from "zod";

export const RouteSpecSchema = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
  purpose: z.string(),
});

export const FilePlanSchema = z.object({
  path: z.string(),
  purpose: z.string(),
  exports: z.array(z.string()).default([]),
});

export const SharedRecordSchema = z.object({
  name: z.string(),
  summary: z.string(),
});
