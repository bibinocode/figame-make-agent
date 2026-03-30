import type {
  PromptGenerationArtifactKey,
  PromptGenerationStepId,
} from "./workflow-schema";
import type {
  PromptGenerationStepDefinition,
  PromptGenerationStepNode,
} from "../shared/node-types";
import { promptGenerationEntryNode } from "../assembly/entry/node";
import { promptGenerationAssemblyNode } from "../assembly/project-assembly/node";
import { promptGenerationMocksNode } from "../foundation/mocks/node";
import { promptGenerationTypesNode } from "../foundation/types/node";
import { promptGenerationUtilsNode } from "../foundation/utils/node";
import { promptGenerationDomainLogicNode } from "../logic/domain-logic/node";
import { promptGenerationHooksNode } from "../logic/hooks/node";
import { promptGenerationPlanNode } from "../planning/plan/node";
import { promptGenerationComponentsNode } from "../views/components/node";
import { promptGenerationLayoutNode } from "../views/layout/node";
import { promptGenerationPagesNode } from "../views/pages/node";
import { promptGenerationStylesNode } from "../views/styles/node";

export const PROMPT_GENERATION_STEP_NODES = [
  promptGenerationPlanNode,
  promptGenerationTypesNode,
  promptGenerationUtilsNode,
  promptGenerationMocksNode,
  promptGenerationDomainLogicNode,
  promptGenerationHooksNode,
  promptGenerationComponentsNode,
  promptGenerationPagesNode,
  promptGenerationLayoutNode,
  promptGenerationStylesNode,
  promptGenerationEntryNode,
  promptGenerationAssemblyNode,
] as const satisfies readonly PromptGenerationStepNode[];

export const PROMPT_GENERATION_TOTAL_STEP_COUNT =
  PROMPT_GENERATION_STEP_NODES.length;

const promptGenerationStepNodeMap = new Map(
  PROMPT_GENERATION_STEP_NODES.map((node) => [node.id, node] as const),
);

const promptGenerationArtifactSchemaMap = new Map(
  PROMPT_GENERATION_STEP_NODES.map((node) => [node.outputArtifactKey, node.schema] as const),
);

export function getPromptGenerationStepNode(stepId: PromptGenerationStepId) {
  return promptGenerationStepNodeMap.get(stepId) ?? null;
}

export function getPromptGenerationStepCatalog(): PromptGenerationStepDefinition[] {
  return PROMPT_GENERATION_STEP_NODES.map((node) => ({
    id: node.id,
    phaseId: node.phaseId,
    title: node.title,
    goal: node.goal,
    dependsOn: node.dependsOn,
    inputArtifactKeys: node.inputArtifactKeys,
    outputArtifactKey: node.outputArtifactKey,
    maxAttempts: node.maxAttempts,
  }));
}

export function getPromptGenerationArtifactSchema(key: PromptGenerationArtifactKey) {
  return promptGenerationArtifactSchemaMap.get(key);
}
