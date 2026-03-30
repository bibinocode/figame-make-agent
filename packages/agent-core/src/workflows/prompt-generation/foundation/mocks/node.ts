import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import { buildMocksSystemPrompt, buildMocksUserPrompt } from "./prompts";
import { PromptMocksArtifactSchema } from "./schema";

export const promptGenerationMocksNode = createPromptGenerationStepNode({
  id: "mocks",
  phaseId: "foundation",
  title: "模拟数据",
  goal: "规划模拟数据文件，覆盖关键页面和核心场景。",
  dependsOn: ["plan", "types"],
  inputArtifactKeys: ["plan", "typesSpec"],
  outputArtifactKey: "mockDataSpec",
  maxAttempts: 3,
  schema: PromptMocksArtifactSchema,
  buildSystemPrompt: buildMocksSystemPrompt,
  buildUserPrompt: buildMocksUserPrompt,
});
