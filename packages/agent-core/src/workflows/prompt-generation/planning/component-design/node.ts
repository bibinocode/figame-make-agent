import type { WorkflowCapabilities } from "../../../../capabilities";
import type { WorkflowIntent } from "../../../../intent";
import type { WorkflowUi } from "../../../../ui";
import {
  buildWorkflowComponentContractsSystemPrompt,
  buildWorkflowComponentContractsUserPrompt,
  WorkflowComponentContractsSchema,
} from "../../../../component-contracts";
import { createPromptGenerationStepNode } from "../../shared/create-step-node";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWorkflowUi(value: unknown): value is WorkflowUi {
  return (
    isRecord(value) &&
    Array.isArray(value.routes) &&
    Array.isArray(value.pages) &&
    Array.isArray(value.componentInventory) &&
    isRecord(value.themeStrategy)
  );
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
    typeof value.category === "string"
  );
}

export const promptGenerationComponentDesignNode =
  createPromptGenerationStepNode({
    id: "componentDesign",
    phaseId: "planning",
    title: "组件设计",
    goal: "把 UI 架构中的业务组件转换成可编码的组件契约。",
    dependsOn: ["uiDesign"],
    inputArtifactKeys: ["ui", "capabilities", "intent"],
    outputArtifactKey: "componentContracts",
    maxAttempts: 3,
    schema: WorkflowComponentContractsSchema,
    buildSystemPrompt: () => buildWorkflowComponentContractsSystemPrompt(),
    buildUserPrompt: (context) => {
      const uiData = context.dependencyArtifacts.find(
        (artifact) => artifact.key === "ui",
      )?.data;
      const capabilitiesData = context.dependencyArtifacts.find(
        (artifact) => artifact.key === "capabilities",
      )?.data;
      const intentData = context.dependencyArtifacts.find(
        (artifact) => artifact.key === "intent",
      )?.data;

      if (!isWorkflowUi(uiData)) {
        return "上游 ui 缺失，请直接返回 null。";
      }

      return buildWorkflowComponentContractsUserPrompt({
        uiJson: JSON.stringify(uiData, null, 2),
        capabilitiesJson: isWorkflowCapabilities(capabilitiesData)
          ? JSON.stringify(capabilitiesData, null, 2)
          : "null",
        intentJson: isWorkflowIntent(intentData)
          ? JSON.stringify(intentData, null, 2)
          : undefined,
      });
    },
  });
