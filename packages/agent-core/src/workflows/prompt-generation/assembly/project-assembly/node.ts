import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import {
  buildAssemblySystemPrompt,
  buildAssemblyUserPrompt,
} from "./prompts";
import { PromptAssemblyArtifactSchema } from "./schema";

export const promptGenerationAssemblyNode =
  createPromptGenerationStepNode({
    id: "assembly",
    phaseId: "assembly",
    title: "项目组装",
    goal: "汇总所有文件结构并给出项目组装结果。",
    dependsOn: ["entry"],
    inputArtifactKeys: [
      "plan",
      "typesSpec",
      "utilsSpec",
      "mockDataSpec",
      "domainLogicSpec",
      "hooksSpec",
      "componentsSpec",
      "pagesSpec",
      "layoutSpec",
      "stylesSpec",
      "entrySpec",
    ],
    outputArtifactKey: "assemblySpec",
    maxAttempts: 3,
    schema: PromptAssemblyArtifactSchema,
    buildSystemPrompt: buildAssemblySystemPrompt,
    buildUserPrompt: buildAssemblyUserPrompt,
  });
