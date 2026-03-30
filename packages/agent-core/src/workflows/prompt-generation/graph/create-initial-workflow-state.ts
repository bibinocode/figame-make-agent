import {
  type PromptGenerationDesignContext,
  type PromptGenerationWorkflowState,
  PromptGenerationWorkflowStateSchema,
} from "./workflow-schema";
import {
  getPromptGenerationPhaseTitle,
  PROMPT_GENERATION_PHASE_ORDER,
} from "./step-catalog";
import { PROMPT_GENERATION_STEP_NODES } from "./step-registry";

function createWorkflowId() {
  return `prompt-workflow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type CreateInitialPromptGenerationWorkflowStateOptions = {
  designContext?: PromptGenerationDesignContext | null;
};

export function createInitialPromptGenerationWorkflowState(
  userPrompt: string,
  options: CreateInitialPromptGenerationWorkflowStateOptions = {},
) {
  const now = new Date().toISOString();

  return PromptGenerationWorkflowStateSchema.parse({
    workflowMeta: {
      workflowId: createWorkflowId(),
      intent: "create_from_prompt",
      status: "planning",
      currentPhaseId: "planning",
      currentStepId: "plan",
      userPrompt,
      createdAt: now,
      updatedAt: now,
    },
    phases: PROMPT_GENERATION_PHASE_ORDER.map((id) => ({
      id,
      status: id === "planning" ? "running" : "pending",
      title: getPromptGenerationPhaseTitle(id),
    })),
    steps: PROMPT_GENERATION_STEP_NODES.map((step, index) => ({
      id: step.id,
      phaseId: step.phaseId,
      title: step.title,
      status: index === 0 ? "running" : "pending",
      attemptCount: 0,
      lastError: null,
      outputPreview: null,
      startedAt: index === 0 ? now : null,
      completedAt: null,
    })),
    artifacts: {},
    designContext: options.designContext ?? null,
    summary: {
      completedStepCount: 0,
      totalStepCount: PROMPT_GENERATION_STEP_NODES.length,
      totalFiles: 0,
      entryFiles: [],
      appName: null,
    },
  }) satisfies PromptGenerationWorkflowState;
}
