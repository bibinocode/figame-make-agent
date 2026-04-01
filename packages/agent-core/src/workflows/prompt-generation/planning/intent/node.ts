import type { WorkflowAnalysisResult } from "../../../../analysis";
import {
  buildWorkflowIntentSystemPrompt,
  buildWorkflowIntentUserPrompt,
  WorkflowIntentSchema,
} from "../../../../intent";
import { createPromptGenerationStepNode } from "../../shared/create-step-node";

function getAnalysisArtifactData(
  dependencyArtifacts: ReadonlyArray<{ key: string; data: unknown }>,
) {
  const artifact = dependencyArtifacts.find((item) => item.key === "analysis");
  return artifact?.data;
}

function isWorkflowAnalysisResult(value: unknown): value is WorkflowAnalysisResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<WorkflowAnalysisResult>;
  return (
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.tags) &&
    typeof candidate.type === "string" &&
    typeof candidate.complexity === "string" &&
    ("designAnalysis" in candidate
      ? candidate.designAnalysis === null ||
        typeof candidate.designAnalysis === "string"
      : false)
  );
}

export const promptGenerationIntentNode = createPromptGenerationStepNode({
  id: "intent",
  phaseId: "planning",
  title: "意图识别",
  goal: "把需求分析结果抽象为产品层意图，供后续规划与设计节点复用。",
  dependsOn: ["analysis"],
  inputArtifactKeys: ["analysis"],
  outputArtifactKey: "intent",
  maxAttempts: 3,
  schema: WorkflowIntentSchema,
  buildSystemPrompt: () => buildWorkflowIntentSystemPrompt(),
  buildUserPrompt: (context) => {
    const analysisData = getAnalysisArtifactData(context.dependencyArtifacts);

    if (!isWorkflowAnalysisResult(analysisData)) {
      return "需求分析结果缺失，请返回 null。";
    }

    return buildWorkflowIntentUserPrompt({
      analysisSummary: analysisData.summary,
      analysisTags: analysisData.tags,
      designAnalysis: analysisData.designAnalysis,
    });
  },
});
