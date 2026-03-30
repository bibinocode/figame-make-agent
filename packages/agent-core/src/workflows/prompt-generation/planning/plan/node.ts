import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildPlanSystemPrompt, buildPlanUserPrompt } from "./prompts";
import { PromptPlanArtifactSchema } from "./schema";

export const promptGenerationPlanNode = createPromptGenerationStepNode({
  id: "plan",
  phaseId: "planning",
  title: "应用规划",
  goal: "先把应用目标、页面结构、数据模型和实现约束规划清楚。",
  dependsOn: [],
  inputArtifactKeys: [],
  outputArtifactKey: "plan",
  maxAttempts: 3,
  schema: PromptPlanArtifactSchema,
  buildSystemPrompt: buildPlanSystemPrompt,
  buildUserPrompt: buildPlanUserPrompt,
});
