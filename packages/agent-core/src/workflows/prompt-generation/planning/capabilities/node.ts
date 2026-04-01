import type { WorkflowIntent } from "../../../../intent";
import {
  buildWorkflowCapabilitiesSystemPrompt,
  buildWorkflowCapabilitiesUserPrompt,
  WorkflowCapabilitiesSchema,
} from "../../../../capabilities";
import { createPromptGenerationStepNode } from "../../shared/create-step-node";

function getIntentArtifactData(
  dependencyArtifacts: ReadonlyArray<{ key: string; data: unknown }>,
) {
  return dependencyArtifacts.find((item) => item.key === "intent")?.data;
}

function isWorkflowIntent(value: unknown): value is WorkflowIntent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<WorkflowIntent>;
  return (
    typeof candidate.category === "string" &&
    typeof candidate.product === "object" &&
    candidate.product !== null &&
    typeof candidate.product.name === "string" &&
    typeof candidate.product.description === "string" &&
    Array.isArray(candidate.product.targetUsers) &&
    typeof candidate.product.primaryScenario === "string" &&
    typeof candidate.goals === "object" &&
    candidate.goals !== null &&
    Array.isArray(candidate.goals.primary)
  );
}

export const promptGenerationCapabilitiesNode = createPromptGenerationStepNode({
  id: "capabilities",
  phaseId: "planning",
  title: "能力检查",
  goal: "把产品意图翻译成 MVP 能力蓝图，约束页面、行为、数据模型之间的闭环关系。",
  dependsOn: ["intent"],
  inputArtifactKeys: ["intent"],
  outputArtifactKey: "capabilities",
  maxAttempts: 3,
  schema: WorkflowCapabilitiesSchema,
  buildSystemPrompt: () => buildWorkflowCapabilitiesSystemPrompt(),
  buildUserPrompt: (context) => {
    const intentData = getIntentArtifactData(context.dependencyArtifacts);

    if (!isWorkflowIntent(intentData)) {
      return "上游 intent 缺失，请直接返回 null。";
    }

    return buildWorkflowCapabilitiesUserPrompt({
      intentJson: JSON.stringify(intentData, null, 2),
    });
  },
});
