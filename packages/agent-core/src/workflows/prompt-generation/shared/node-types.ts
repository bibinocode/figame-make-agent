import type { z } from "zod";
import { z as zod } from "zod";
import type {
  PromptGenerationArtifactEnvelope,
  PromptGenerationArtifactKey,
  PromptGenerationPhaseId,
  PromptGenerationStepId,
  PromptGenerationStepState,
  PromptGenerationWorkflowState,
} from "../graph/workflow-schema";
import {
  PromptGenerationArtifactKeySchema,
  PromptGenerationPhaseIdSchema,
  PromptGenerationStepIdSchema,
} from "../graph/workflow-schema";

export const PromptGenerationStepDefinitionSchema = zod.object({
  id: PromptGenerationStepIdSchema,
  phaseId: PromptGenerationPhaseIdSchema,
  title: zod.string(),
  goal: zod.string(),
  dependsOn: zod.array(PromptGenerationStepIdSchema).default([]),
  inputArtifactKeys: zod.array(PromptGenerationArtifactKeySchema).default([]),
  outputArtifactKey: PromptGenerationArtifactKeySchema,
  maxAttempts: zod.number().int().positive().default(3),
});

export type PromptGenerationStepDefinition = zod.infer<
  typeof PromptGenerationStepDefinitionSchema
>;

export type PromptGenerationNodePromptContext = {
  userPrompt: string;
  workflow: PromptGenerationWorkflowState;
  step: PromptGenerationStepState;
  stepDefinition: PromptGenerationStepDefinition;
  stepNode: PromptGenerationStepNode;
  dependencyArtifacts: PromptGenerationArtifactEnvelope[];
  retryInstruction?: string | null;
};

export type PromptGenerationStepNode = PromptGenerationStepDefinition & {
  schema: z.ZodTypeAny;
  buildSystemPrompt: (context: PromptGenerationNodePromptContext) => string;
  buildUserPrompt: (context: PromptGenerationNodePromptContext) => string;
};

export type PromptGenerationArtifactSchemaMap = Record<
  PromptGenerationArtifactKey,
  z.ZodTypeAny
>;
