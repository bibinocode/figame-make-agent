import type { WorkflowCapabilities } from "../../../../capabilities";
import type { WorkflowComponentContracts } from "../../../../component-contracts";
import type { WorkflowUi } from "../../../../ui";
import {
  buildWorkflowStructureSystemPrompt,
  buildWorkflowStructureUserPrompt,
  WorkflowStructureSchema,
} from "../../../../structure-plan";
import { createPromptGenerationStepNode } from "../../shared/create-step-node";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWorkflowUi(value: unknown): value is WorkflowUi {
  return (
    isRecord(value) &&
    Array.isArray(value.routes) &&
    Array.isArray(value.pages) &&
    Array.isArray(value.componentInventory)
  );
}

function isWorkflowComponentContracts(
  value: unknown,
): value is WorkflowComponentContracts {
  return isRecord(value) && Array.isArray(value.components);
}

function isWorkflowCapabilities(value: unknown): value is WorkflowCapabilities {
  return (
    isRecord(value) &&
    Array.isArray(value.pages) &&
    Array.isArray(value.behaviors) &&
    Array.isArray(value.dataModels)
  );
}

export const promptGenerationStructurePlanNode =
  createPromptGenerationStepNode({
    id: "structurePlan",
    phaseId: "planning",
    title: "结构规划",
    goal: "把页面、组件和数据模型映射成可执行的文件清单与路由表。",
    dependsOn: ["componentDesign"],
    inputArtifactKeys: ["ui", "componentContracts", "capabilities"],
    outputArtifactKey: "structure",
    maxAttempts: 3,
    schema: WorkflowStructureSchema,
    buildSystemPrompt: () => buildWorkflowStructureSystemPrompt(),
    buildUserPrompt: (context) => {
      const uiData = context.dependencyArtifacts.find(
        (artifact) => artifact.key === "ui",
      )?.data;
      const componentContractsData = context.dependencyArtifacts.find(
        (artifact) => artifact.key === "componentContracts",
      )?.data;
      const capabilitiesData = context.dependencyArtifacts.find(
        (artifact) => artifact.key === "capabilities",
      )?.data;

      if (
        !isWorkflowUi(uiData) ||
        !isWorkflowComponentContracts(componentContractsData) ||
        !isWorkflowCapabilities(capabilitiesData)
      ) {
        return "上游核心输入缺失，请直接返回 null。";
      }

      return buildWorkflowStructureUserPrompt({
        uiJson: JSON.stringify(uiData, null, 2),
        componentContractsJson: JSON.stringify(componentContractsData, null, 2),
        capabilitiesJson: JSON.stringify(capabilitiesData, null, 2),
      });
    },
  });
