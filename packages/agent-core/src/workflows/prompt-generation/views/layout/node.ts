import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildLayoutSystemPrompt, buildLayoutUserPrompt } from "./prompts";
import { PromptLayoutArtifactSchema } from "./schema";

export const promptGenerationLayoutNode = createPromptGenerationStepNode({
  id: "layout",
  phaseId: "views",
  title: "布局组件",
  goal: "规划全局壳层、导航、侧栏和页面容器布局。",
  dependsOn: ["pages"],
  inputArtifactKeys: ["plan", "pagesSpec", "componentsSpec"],
  outputArtifactKey: "layoutSpec",
  maxAttempts: 3,
  schema: PromptLayoutArtifactSchema,
  buildSystemPrompt: buildLayoutSystemPrompt,
  buildUserPrompt: buildLayoutUserPrompt,
});
