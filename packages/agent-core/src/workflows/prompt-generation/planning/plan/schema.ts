import { z } from "zod";
import {
  RouteSpecSchema,
  SharedRecordSchema,
} from "../../shared/schema-primitives";

export const PromptPlanArtifactSchema = z.object({
  appName: z.string(),
  summary: z.string(),
  userGoals: z.array(z.string()).min(1),
  targetUsers: z.array(z.string()).default([]),
  routes: z.array(RouteSpecSchema).min(1),
  domainEntities: z.array(SharedRecordSchema).default([]),
  uiStyleGuidelines: z.array(z.string()).default([]),
  implementationNotes: z.array(z.string()).default([]),
});

export type PromptPlanArtifact = z.infer<typeof PromptPlanArtifactSchema>;
