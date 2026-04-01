import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import {
  buildComponentsSystemPrompt,
  buildComponentsUserPrompt,
} from "./prompts";
import { PromptComponentsArtifactSchema } from "./schema";

export const promptGenerationComponentsNode =
  createPromptGenerationStepNode({
    id: "components",
    phaseId: "views",
    title: "组件代码",
    goal: "拆出复用组件和局部组件，明确职责。",
    dependsOn: ["hooks"],
    inputArtifactKeys: ["plan", "ui", "componentContracts", "typesSpec", "hooksSpec"],
    outputArtifactKey: "componentsSpec",
    maxAttempts: 3,
    schema: PromptComponentsArtifactSchema,
    buildSystemPrompt: buildComponentsSystemPrompt,
    buildUserPrompt: buildComponentsUserPrompt,
  });
