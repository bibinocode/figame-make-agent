import type { WorkflowAnalysisResult } from "../../../../analysis";
import type { WorkflowCapabilities } from "../../../../capabilities";
import type { WorkflowIntent } from "../../../../intent";
import {
  buildWorkflowUiSystemPrompt,
  buildWorkflowUiUserPrompt,
  WorkflowUiSchema,
} from "../../../../ui";
import { createPromptGenerationStepNode } from "../../shared/create-step-node";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWorkflowCapabilities(value: unknown): value is WorkflowCapabilities {
  return (
    isRecord(value) &&
    Array.isArray(value.pages) &&
    Array.isArray(value.behaviors) &&
    Array.isArray(value.dataModels)
  );
}

function isWorkflowIntent(value: unknown): value is WorkflowIntent {
  return (
    isRecord(value) &&
    isRecord(value.product) &&
    typeof value.product.name === "string" &&
    isRecord(value.goals) &&
    Array.isArray(value.goals.primary) &&
    typeof value.category === "string"
  );
}

function isWorkflowAnalysisResult(value: unknown): value is WorkflowAnalysisResult {
  return (
    isRecord(value) &&
    typeof value.summary === "string" &&
    Array.isArray(value.tags) &&
    typeof value.type === "string" &&
    typeof value.complexity === "string"
  );
}

export const promptGenerationUiDesignNode = createPromptGenerationStepNode({
  id: "uiDesign",
  phaseId: "planning",
  title: "UI 设计",
  goal: "把产品意图和能力蓝图转换成可执行的 UI 框架蓝图。",
  dependsOn: ["capabilities"],
  inputArtifactKeys: ["capabilities", "intent", "analysis"],
  outputArtifactKey: "ui",
  maxAttempts: 3,
  schema: WorkflowUiSchema,
  buildSystemPrompt: () => buildWorkflowUiSystemPrompt(),
  buildUserPrompt: (context) => {
    const capabilitiesData = context.dependencyArtifacts.find(
      (artifact) => artifact.key === "capabilities",
    )?.data;
    const intentData = context.dependencyArtifacts.find(
      (artifact) => artifact.key === "intent",
    )?.data;
    const analysisData = context.dependencyArtifacts.find(
      (artifact) => artifact.key === "analysis",
    )?.data;

    if (!isWorkflowCapabilities(capabilitiesData)) {
      return "上游 capabilities 缺失，请直接返回 null。";
    }

    return buildWorkflowUiUserPrompt({
      capabilitiesJson: JSON.stringify(capabilitiesData, null, 2),
      intentJson: isWorkflowIntent(intentData)
        ? JSON.stringify(intentData, null, 2)
        : undefined,
      designAnalysis: isWorkflowAnalysisResult(analysisData)
        ? analysisData.designAnalysis
        : null,
    });
  },
});
