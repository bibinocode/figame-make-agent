import { createPromptGenerationStepNode } from "../../shared/create-step-node";
import {
  buildDomainLogicSystemPrompt,
  buildDomainLogicUserPrompt,
} from "./prompts";
import { PromptDomainLogicArtifactSchema } from "./schema";

export const promptGenerationDomainLogicNode =
  createPromptGenerationStepNode({
    id: "domainLogic",
    phaseId: "logic",
    title: "业务逻辑",
    goal: "组织业务逻辑文件、服务层和状态流。",
    dependsOn: ["types", "utils", "mocks"],
    inputArtifactKeys: ["plan", "typesSpec", "utilsSpec", "mockDataSpec"],
    outputArtifactKey: "domainLogicSpec",
    maxAttempts: 3,
    schema: PromptDomainLogicArtifactSchema,
    buildSystemPrompt: buildDomainLogicSystemPrompt,
    buildUserPrompt: buildDomainLogicUserPrompt,
  });
