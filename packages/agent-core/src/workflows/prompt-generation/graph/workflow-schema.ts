import { z } from "zod";

export const PromptGenerationPhaseIdSchema = z.enum([
  "planning",
  "foundation",
  "logic",
  "views",
  "assembly",
]);

export const PromptGenerationStepIdSchema = z.enum([
  "analysis",
  "intent",
  "capabilities",
  "uiDesign",
  "componentDesign",
  "structurePlan",
  "plan",
  "types",
  "utils",
  "mocks",
  "domainLogic",
  "hooks",
  "components",
  "pages",
  "layout",
  "styles",
  "entry",
  "assembly",
]);

export const PromptGenerationArtifactKeySchema = z.enum([
  "analysis",
  "intent",
  "capabilities",
  "ui",
  "componentContracts",
  "structure",
  "plan",
  "typesSpec",
  "utilsSpec",
  "mockDataSpec",
  "domainLogicSpec",
  "hooksSpec",
  "componentsSpec",
  "pagesSpec",
  "layoutSpec",
  "stylesSpec",
  "entrySpec",
  "assemblySpec",
]);

export const PromptGenerationWorkflowStatusSchema = z.enum([
  "idle",
  "planning",
  "running",
  "retrying",
  "completed",
  "failed",
]);

export const PromptGenerationStepStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "blocked",
]);

export const PromptGenerationArtifactEnvelopeSchema = z.object({
  key: PromptGenerationArtifactKeySchema,
  sourceStepId: PromptGenerationStepIdSchema,
  updatedAt: z.string(),
  data: z.unknown(),
});

export const PromptGenerationPhaseStateSchema = z.object({
  id: PromptGenerationPhaseIdSchema,
  status: PromptGenerationStepStatusSchema,
  title: z.string(),
});

export const PromptGenerationStepStateSchema = z.object({
  id: PromptGenerationStepIdSchema,
  phaseId: PromptGenerationPhaseIdSchema,
  title: z.string(),
  status: PromptGenerationStepStatusSchema,
  attemptCount: z.number().int().nonnegative().default(0),
  lastError: z.string().nullable().default(null),
  outputPreview: z.string().nullable().default(null),
  startedAt: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
});

export const PromptGenerationDesignContextSchema = z.object({
  colors: z.object({
    accent: z.string(),
    accentSoft: z.string(),
    background: z.string(),
    panel: z.string(),
    text: z.string(),
  }),
  motion: z.object({
    fast: z.string(),
    normal: z.string(),
    slow: z.string(),
  }),
  query: z.string(),
  rules: z.array(z.string()),
  source: z.string(),
  styleKeywords: z.array(z.string()),
  styleName: z.string(),
  typography: z.object({
    body: z.string(),
    mono: z.string(),
  }),
});

export const PromptGenerationWorkflowMetaSchema = z.object({
  workflowId: z.string(),
  intent: z.literal("create_from_prompt"),
  status: PromptGenerationWorkflowStatusSchema,
  currentPhaseId: PromptGenerationPhaseIdSchema.nullable(),
  currentStepId: PromptGenerationStepIdSchema.nullable(),
  skipGeneration: z.boolean().default(false),
  userPrompt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PromptGenerationSummarySchema = z.object({
  completedStepCount: z.number().int().nonnegative().default(0),
  totalStepCount: z.number().int().positive().default(18),
  totalFiles: z.number().int().nonnegative().default(0),
  entryFiles: z.array(z.string()).default([]),
  appName: z.string().nullable().default(null),
});

export const PromptGenerationWorkflowStateSchema = z.object({
  workflowMeta: PromptGenerationWorkflowMetaSchema,
  phases: z.array(PromptGenerationPhaseStateSchema),
  steps: z.array(PromptGenerationStepStateSchema),
  artifacts: z.partialRecord(
    PromptGenerationArtifactKeySchema,
    PromptGenerationArtifactEnvelopeSchema,
  ),
  designContext: PromptGenerationDesignContextSchema.nullable().default(null),
  summary: PromptGenerationSummarySchema,
});

export type PromptGenerationPhaseId = z.infer<
  typeof PromptGenerationPhaseIdSchema
>;
export type PromptGenerationStepId = z.infer<typeof PromptGenerationStepIdSchema>;
export type PromptGenerationArtifactKey = z.infer<
  typeof PromptGenerationArtifactKeySchema
>;
export type PromptGenerationWorkflowStatus = z.infer<
  typeof PromptGenerationWorkflowStatusSchema
>;
export type PromptGenerationStepStatus = z.infer<
  typeof PromptGenerationStepStatusSchema
>;
export type PromptGenerationArtifactEnvelope = z.infer<
  typeof PromptGenerationArtifactEnvelopeSchema
>;
export type PromptGenerationPhaseState = z.infer<
  typeof PromptGenerationPhaseStateSchema
>;
export type PromptGenerationStepState = z.infer<
  typeof PromptGenerationStepStateSchema
>;
export type PromptGenerationDesignContext = z.infer<
  typeof PromptGenerationDesignContextSchema
>;
export type PromptGenerationWorkflowMeta = z.infer<
  typeof PromptGenerationWorkflowMetaSchema
>;
export type PromptGenerationSummary = z.infer<
  typeof PromptGenerationSummarySchema
>;
export type PromptGenerationWorkflowState = z.infer<
  typeof PromptGenerationWorkflowStateSchema
>;
