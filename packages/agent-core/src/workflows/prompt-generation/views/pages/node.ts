import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildPagesSystemPrompt, buildPagesUserPrompt } from "./prompts";
import { PromptPagesArtifactSchema } from "./schema";

export const promptGenerationPagesNode = createPromptGenerationStepNode({
  id: "pages",
  phaseId: "views",
  title: "页面代码",
  goal: "规划页面文件及每个页面的核心展示内容。",
  dependsOn: ["components", "hooks"],
  inputArtifactKeys: ["plan", "ui", "typesSpec", "hooksSpec", "componentsSpec"],
  outputArtifactKey: "pagesSpec",
  maxAttempts: 3,
  schema: PromptPagesArtifactSchema,
  buildSystemPrompt: buildPagesSystemPrompt,
  buildUserPrompt: buildPagesUserPrompt,
});
