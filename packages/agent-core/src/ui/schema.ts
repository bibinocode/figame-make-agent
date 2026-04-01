import { z } from "zod";

export const WorkflowUiRouteSchema = z.object({
  routeId: z.string().min(1),
  title: z.string().min(1),
  path: z.string().min(1),
  pageId: z.string().min(1),
});

export const WorkflowUiSectionSchema = z.object({
  sectionId: z.string().min(1),
  title: z.string().min(1),
  purpose: z.string().min(1),
  componentIds: z.array(z.string()).min(1),
});

export const WorkflowUiPageSchema = z.object({
  pageId: z.string().min(1),
  title: z.string().min(1),
  layout: z.string().min(1),
  sections: z.array(WorkflowUiSectionSchema).min(1),
  primaryComponentIds: z.array(z.string()).min(1),
  behaviorIds: z.array(z.string()).min(1),
  dataModelIds: z.array(z.string()).min(1),
});

export const WorkflowUiComponentInventorySchema = z.object({
  componentId: z.string().min(1),
  name: z.string().min(1),
  kind: z.string().min(1),
  summary: z.string().min(1),
  pageIds: z.array(z.string()).min(1),
  behaviorIds: z.array(z.string()).min(1),
  dataModelIds: z.array(z.string()).min(1),
});

export const WorkflowUiThemeStrategySchema = z.object({
  styleTone: z.array(z.string()).min(1),
  visualGuidelines: z.array(z.string()).min(1),
  designConstraints: z.array(z.string()).min(1),
});

export const WorkflowUiSchema = z.object({
  routes: z.array(WorkflowUiRouteSchema).min(1),
  pages: z.array(WorkflowUiPageSchema).min(1),
  componentInventory: z.array(WorkflowUiComponentInventorySchema).min(1),
  themeStrategy: WorkflowUiThemeStrategySchema,
});

export const NullableWorkflowUiSchema = WorkflowUiSchema.nullable();

export type WorkflowUi = z.infer<typeof WorkflowUiSchema>;
