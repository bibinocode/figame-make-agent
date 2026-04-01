import { z } from "zod";

export const WorkflowStructureFileSchema = z.object({
  path: z.string().min(1),
  kind: z.string().min(1),
  description: z.string().min(1),
  sourceCorrelation: z.array(z.string()).min(1),
  generatedBy: z.array(z.string()).min(1),
});

export const WorkflowStructureRouteSchema = z.object({
  path: z.string().min(1),
  pageId: z.string().min(1),
  componentIds: z.array(z.string()).min(1),
});

export const WorkflowStructureSchema = z.object({
  files: z.array(WorkflowStructureFileSchema).min(1),
  routingTable: z.array(WorkflowStructureRouteSchema).min(1),
  foundationStrategy: z.array(z.string()).min(1),
});

export const NullableWorkflowStructureSchema =
  WorkflowStructureSchema.nullable();

export type WorkflowStructurePlan = z.infer<typeof WorkflowStructureSchema>;
