import { Annotation } from "@langchain/langgraph";
import type {
  PromptGenerationArtifactEnvelope,
  PromptGenerationArtifactKey,
  PromptGenerationDesignContext,
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
  designContext: Annotation<
    PromptGenerationDesignContext | null,
    PromptGenerationDesignContext | null | undefined
  >({
    reducer: (left, right) => right ?? left,
    default: () => null,
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
  designContext?: PromptGenerationDesignContext | null;
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
    designContext:
      patch.designContext === undefined
        ? current.designContext
        : patch.designContext,
    summary: {
      ...current.summary,
      ...patch.summary,
    },
  };
}
