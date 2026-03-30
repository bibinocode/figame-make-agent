import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildEntrySystemPrompt, buildEntryUserPrompt } from "./prompts";
import { PromptEntryArtifactSchema } from "./schema";

export const promptGenerationEntryNode = createPromptGenerationStepNode({
  id: "entry",
  phaseId: "assembly",
  title: "入口文件",
  goal: "规划入口文件、路由挂载和应用初始化。",
  dependsOn: ["pages", "layout", "styles"],
  inputArtifactKeys: ["pagesSpec", "layoutSpec", "stylesSpec"],
  outputArtifactKey: "entrySpec",
  maxAttempts: 3,
  schema: PromptEntryArtifactSchema,
  buildSystemPrompt: buildEntrySystemPrompt,
  buildUserPrompt: buildEntryUserPrompt,
});
