import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildTypesSystemPrompt, buildTypesUserPrompt } from "./prompts";
import { PromptTypesArtifactSchema } from "./schema";

export const promptGenerationTypesNode = createPromptGenerationStepNode({
  id: "types",
  phaseId: "foundation",
  title: "类型生成",
  goal: "定义业务数据类型、视图模型和核心接口。",
  dependsOn: ["plan"],
  inputArtifactKeys: ["plan"],
  outputArtifactKey: "typesSpec",
  maxAttempts: 3,
  schema: PromptTypesArtifactSchema,
  buildSystemPrompt: buildTypesSystemPrompt,
  buildUserPrompt: buildTypesUserPrompt,
});
