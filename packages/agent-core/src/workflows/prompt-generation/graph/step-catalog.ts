import type { PromptGenerationPhaseId, PromptGenerationStepId } from "./workflow-schema";
import type { PromptGenerationStepDefinition } from "../shared/node-types";
import {
  getPromptGenerationStepCatalog,
} from "./step-registry";

export const PROMPT_GENERATION_PHASE_ORDER: PromptGenerationPhaseId[] = [
  "planning",
  "foundation",
  "logic",
  "views",
  "assembly",
];

export const PROMPT_GENERATION_PHASE_TITLES: Record<
  PromptGenerationPhaseId,
  string
> = {
  planning: "规划",
  foundation: "基础建设",
  logic: "逻辑构建",
  views: "视图构建",
  assembly: "应用组装",
};

export const PROMPT_GENERATION_STEP_CATALOG = getPromptGenerationStepCatalog();

export function getPromptGenerationStepDefinition(
  stepId: PromptGenerationStepId,
) {
  return PROMPT_GENERATION_STEP_CATALOG.find((step) => step.id === stepId) ?? null;
}

export function getPromptGenerationPhaseTitle(phaseId: PromptGenerationPhaseId) {
  return PROMPT_GENERATION_PHASE_TITLES[phaseId];
}

export function getPromptGenerationStepTitle(stepId: PromptGenerationStepId) {
  return getPromptGenerationStepDefinition(stepId)?.title ?? stepId;
}

export type { PromptGenerationStepDefinition };
