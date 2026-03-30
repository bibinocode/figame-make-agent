import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildHooksSystemPrompt, buildHooksUserPrompt } from "./prompts";
import { PromptHooksArtifactSchema } from "./schema";

export const promptGenerationHooksNode = createPromptGenerationStepNode({
  id: "hooks",
  phaseId: "logic",
  title: "Hooks 层",
  goal: "规划页面和组件需要的 hooks，以及状态读取方式。",
  dependsOn: ["domainLogic"],
  inputArtifactKeys: ["plan", "typesSpec", "domainLogicSpec"],
  outputArtifactKey: "hooksSpec",
  maxAttempts: 3,
  schema: PromptHooksArtifactSchema,
  buildSystemPrompt: buildHooksSystemPrompt,
  buildUserPrompt: buildHooksUserPrompt,
});
