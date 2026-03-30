import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildUtilsSystemPrompt, buildUtilsUserPrompt } from "./prompts";
import { PromptUtilsArtifactSchema } from "./schema";

export const promptGenerationUtilsNode = createPromptGenerationStepNode({
  id: "utils",
  phaseId: "foundation",
  title: "工具函数",
  goal: "规划纯函数工具层，明确用途和导出结构。",
  dependsOn: ["plan", "types"],
  inputArtifactKeys: ["plan", "typesSpec"],
  outputArtifactKey: "utilsSpec",
  maxAttempts: 3,
  schema: PromptUtilsArtifactSchema,
  buildSystemPrompt: buildUtilsSystemPrompt,
  buildUserPrompt: buildUtilsUserPrompt,
});
