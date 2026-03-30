import { Annotation } from "@langchain/langgraph";
import type {
  PromptGenerationArtifactEnvelope,
  PromptGenerationArtifactKey,
  PromptGenerationPhaseState,
  PromptGenerationSummary,
  PromptGenerationWorkflowMeta,
  PromptGenerationWorkflowState,
} from "../graph/workflow-schema";

export const PromptGenerationWorkflowAnnotation = Annotation.Root({
  workflowMeta: Annotation<
    PromptGenerationWorkflowMeta,
    Partial<PromptGenerationWorkflowMeta>
  >({
    reducer: (left, right) => ({
      ...left,
      ...right,
    }),
  }),
  phases: Annotation<PromptGenerationPhaseState[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  steps: Annotation<PromptGenerationWorkflowState["steps"]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  artifacts: Annotation<
    PromptGenerationWorkflowState["artifacts"],
    Partial<Record<PromptGenerationArtifactKey, PromptGenerationArtifactEnvelope>>
  >({
    reducer: (left, right) => ({
      ...left,
      ...right,
    }),
    default: () => ({}),
  }),
  summary: Annotation<PromptGenerationSummary, Partial<PromptGenerationSummary>>({
    reducer: (left, right) => ({
      ...left,
      ...right,
    }),
  }),
});

export type PromptGenerationWorkflowPatch = {
  workflowMeta?: Partial<PromptGenerationWorkflowMeta>;
  phases?: PromptGenerationPhaseState[];
  steps?: PromptGenerationWorkflowState["steps"];
  artifacts?: Partial<
    Record<PromptGenerationArtifactKey, PromptGenerationArtifactEnvelope>
  >;
  summary?: Partial<PromptGenerationSummary>;
};

export function applyPromptGenerationWorkflowUpdate(
  current: PromptGenerationWorkflowState,
  patch: PromptGenerationWorkflowPatch,
): PromptGenerationWorkflowState {
  return {
    workflowMeta: {
      ...current.workflowMeta,
      ...patch.workflowMeta,
    },
    phases: patch.phases ?? current.phases,
    steps: patch.steps ?? current.steps,
    artifacts: {
      ...current.artifacts,
      ...patch.artifacts,
    },
    summary: {
      ...current.summary,
      ...patch.summary,
    },
  };
}
