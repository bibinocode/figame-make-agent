import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildStylesSystemPrompt, buildStylesUserPrompt } from "./prompts";
import { PromptStylesArtifactSchema } from "./schema";

export const promptGenerationStylesNode = createPromptGenerationStepNode({
  id: "styles",
  phaseId: "views",
  title: "全局样式",
  goal: "定义主题 token、全局样式和布局风格约束。",
  dependsOn: ["layout"],
  inputArtifactKeys: ["plan", "layoutSpec", "componentsSpec"],
  outputArtifactKey: "stylesSpec",
  maxAttempts: 3,
  schema: PromptStylesArtifactSchema,
  buildSystemPrompt: buildStylesSystemPrompt,
  buildUserPrompt: buildStylesUserPrompt,
});
