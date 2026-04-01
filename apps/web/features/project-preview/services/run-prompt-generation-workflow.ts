import {
  applyPromptGenerationWorkflowUpdate,
  buildPromptGenerationRetryInstruction,
  createInitialPromptGenerationWorkflowState,
  getPromptGenerationArtifactSchema,
  parseStructuredOutput,
  PROMPT_GENERATION_STEP_NODES,
  shouldSkipGeneration,
  type PromptGenerationArtifactKey,
  type PromptGenerationArtifactEnvelope,
  type PromptGenerationPhaseState,
  type PromptGenerationStepId,
  type PromptGenerationStepNode,
  type PromptGenerationWorkflowPatch,
  type PromptGenerationWorkflowState,
  type WorkflowAnalysisResult,
  type WorkflowCapabilities,
  type WorkflowComponentContracts,
  type WorkflowIntent,
  type WorkflowStructurePlan,
  type WorkflowUi,
} from "@figame/agent-core";
import { DEFAULT_PROMPT_GENERATION_DESIGN_CONTEXT } from "../design/workbench-ui-skill-preset";
import { generateStructuredWorkflowStep } from "./generate-structured-workflow-step";
import type {
  WorkbenchChatMessage,
  WorkbenchRouteContext,
} from "../state/workbench-routing-types";

type RunPromptGenerationWorkflowOptions = {
  activeFilePath?: string;
  messageText: string;
  routeContext: WorkbenchRouteContext;
  setPromptGenerationWorkflow: (
    value: PromptGenerationWorkflowState | null,
  ) => void;
  workflowMessageId: string;
  updateMessage: (
    id: string,
    value: Partial<Omit<WorkbenchChatMessage, "createdAt" | "id" | "role">>,
  ) => void;
};

type WorkflowArtifact = PromptGenerationArtifactEnvelope;
type WorkflowArtifactMap = PromptGenerationWorkflowState["artifacts"];

function isArtifactEnvelope(
  value: WorkflowArtifactMap[PromptGenerationArtifactKey] | undefined,
): value is WorkflowArtifact {
  return Boolean(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getArtifactRecord(artifact?: WorkflowArtifact) {
  return isRecord(artifact?.data) ? artifact.data : null;
}

function isWorkflowAnalysisResult(
  value: unknown,
): value is WorkflowAnalysisResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.summary === "string" &&
    typeof value.type === "string" &&
    Array.isArray(value.tags) &&
    typeof value.complexity === "string" &&
    ("designAnalysis" in value
      ? value.designAnalysis === null ||
        typeof value.designAnalysis === "string"
      : false)
  );
}

function isWorkflowIntent(value: unknown): value is WorkflowIntent {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRecord(value.product) &&
    typeof value.product.name === "string" &&
    typeof value.product.description === "string" &&
    Array.isArray(value.product.targetUsers) &&
    typeof value.product.primaryScenario === "string" &&
    isRecord(value.goals) &&
    Array.isArray(value.goals.primary) &&
    typeof value.category === "string"
  );
}

function isWorkflowCapabilities(value: unknown): value is WorkflowCapabilities {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.pages) &&
    Array.isArray(value.behaviors) &&
    Array.isArray(value.dataModels)
  );
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

function isWorkflowComponentContracts(
  value: unknown,
): value is WorkflowComponentContracts {
  return isRecord(value) && Array.isArray(value.components);
}

function isWorkflowStructurePlan(
  value: unknown,
): value is WorkflowStructurePlan {
  return (
    isRecord(value) &&
    Array.isArray(value.files) &&
    Array.isArray(value.routingTable) &&
    Array.isArray(value.foundationStrategy)
  );
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getFilePaths(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      isRecord(item) && typeof item.path === "string" ? item.path : null,
    )
    .filter((item): item is string => Boolean(item));
}

function updateWorkflowStep(
  workflow: PromptGenerationWorkflowState,
  stepId: PromptGenerationStepId,
  updater: (
    current: PromptGenerationWorkflowState["steps"][number],
  ) => PromptGenerationWorkflowState["steps"][number],
) {
  return {
    ...workflow,
    steps: workflow.steps.map((step) =>
      step.id === stepId ? updater(step) : step,
    ),
  };
}

function updatePhaseStatus(workflow: PromptGenerationWorkflowState) {
  const phases = workflow.phases.map((phase: PromptGenerationPhaseState) => {
    const relatedSteps = workflow.steps.filter(
      (step) => step.phaseId === phase.id,
    );

    if (relatedSteps.some((step) => step.status === "failed")) {
      return {
        ...phase,
        status: "failed" as const,
      };
    }

    if (relatedSteps.every((step) => step.status === "completed")) {
      return {
        ...phase,
        status: "completed" as const,
      };
    }

    if (relatedSteps.some((step) => step.status === "running")) {
      return {
        ...phase,
        status: "running" as const,
      };
    }

    return {
      ...phase,
      status: "pending" as const,
    };
  });

  return {
    ...workflow,
    phases,
  };
}

function buildSummaryPatch(
  workflow: PromptGenerationWorkflowState,
  artifact: WorkflowArtifact,
): PromptGenerationWorkflowPatch["summary"] {
  const artifactData = getArtifactRecord(artifact);
  const summary: PromptGenerationWorkflowPatch["summary"] = {
    completedStepCount: workflow.steps.filter(
      (step) => step.status === "completed",
    ).length,
  };

  if (
    artifact.key === "plan" &&
    artifactData &&
    typeof artifactData.appName === "string"
  ) {
    summary.appName = artifactData.appName;
  }

  if (artifact.key === "entrySpec" && artifactData) {
    summary.entryFiles = getFilePaths(artifactData.entryFiles);
  }

  if (artifact.key === "assemblySpec" && artifactData) {
    if (typeof artifactData.totalFiles === "number") {
      summary.totalFiles = artifactData.totalFiles;
    }

    if (!summary.entryFiles?.length) {
      summary.entryFiles = getStringArray(artifactData.rootFiles);
    }
  }

  return summary;
}

function createWorkflowArtifact(
  key: PromptGenerationArtifactKey,
  sourceStepId: PromptGenerationStepId,
  data: unknown,
): WorkflowArtifact {
  return {
    key,
    sourceStepId,
    updatedAt: new Date().toISOString(),
    data,
  };
}

function blockRemainingSteps(
  workflow: PromptGenerationWorkflowState,
  afterStepId: PromptGenerationStepId,
  reason: string,
) {
  let seenCurrentStep = false;
  const steps = workflow.steps.map((step) => {
    if (step.id === afterStepId) {
      seenCurrentStep = true;
      return step;
    }

    if (!seenCurrentStep || step.status === "completed") {
      return step;
    }

    return {
      ...step,
      completedAt: step.completedAt ?? new Date().toISOString(),
      lastError: null,
      outputPreview: reason,
      status: "blocked" as const,
    };
  });

  const phases = workflow.phases.map((phase) => {
    const phaseSteps = steps.filter((step) => step.phaseId === phase.id);

    if (phaseSteps.every((step) => step.status === "blocked")) {
      return {
        ...phase,
        status: "blocked" as const,
      };
    }

    if (
      phaseSteps.some((step) => step.status === "blocked") &&
      phaseSteps.every(
        (step) => step.status === "completed" || step.status === "blocked",
      )
    ) {
      return {
        ...phase,
        status: "completed" as const,
      };
    }

    return phase;
  });

  return {
    ...workflow,
    phases,
    steps,
  };
}

function markStepRunning(
  workflow: PromptGenerationWorkflowState,
  stepNode: PromptGenerationStepNode,
  attemptCount: number,
) {
  const now = new Date().toISOString();
  const nextWorkflow = updatePhaseStatus(
    updateWorkflowStep(workflow, stepNode.id, (current) => ({
      ...current,
      attemptCount,
      lastError: null,
      startedAt: current.startedAt ?? now,
      completedAt: null,
      status: "running",
    })),
  );

  const nextStatus =
    stepNode.id === "plan"
      ? "planning"
      : attemptCount > 1
        ? "retrying"
        : "running";

  return applyPromptGenerationWorkflowUpdate(workflow, {
    phases: nextWorkflow.phases,
    steps: nextWorkflow.steps,
    workflowMeta: {
      currentPhaseId: stepNode.phaseId,
      currentStepId: stepNode.id,
      status: nextStatus,
      updatedAt: now,
    },
  });
}

function buildStepPreview(
  stepNode: PromptGenerationStepNode,
  artifact?: WorkflowArtifact,
) {
  if (!artifact) {
    return `正在执行「${stepNode.title}」节点。`;
  }

  const artifactData = getArtifactRecord(artifact);

  if (artifact.key === "analysis" && isWorkflowAnalysisResult(artifact.data)) {
    return `需求分析完成，意图为「${artifact.data.type}」，摘要：${artifact.data.summary}`;
  }

  if (artifact.key === "intent") {
    if (artifact.data === null) {
      return "意图识别已跳过，上游已判定无需继续生成。";
    }

    if (isWorkflowIntent(artifact.data)) {
      return `意图识别完成，产品为「${artifact.data.product.name}」，类别：${artifact.data.category}`;
    }
  }

  if (artifact.key === "capabilities") {
    if (artifact.data === null) {
      return "能力检查已跳过，上游 intent 缺失，后续生成将停止。";
    }

    if (isWorkflowCapabilities(artifact.data)) {
      return `能力检查完成，识别出 ${artifact.data.pages.length} 个页面、${artifact.data.behaviors.length} 个行为、${artifact.data.dataModels.length} 个数据模型。`;
    }
  }

  if (artifact.key === "ui") {
    if (artifact.data === null) {
      return "UI 设计已跳过，上游 capabilities 缺失。";
    }

    if (isWorkflowUi(artifact.data)) {
      return `UI 设计完成，规划了 ${artifact.data.routes.length} 条路由和 ${artifact.data.componentInventory.length} 个业务组件。`;
    }
  }

  if (artifact.key === "componentContracts") {
    if (artifact.data === null) {
      return "组件设计已跳过，上游 ui 缺失。";
    }

    if (isWorkflowComponentContracts(artifact.data)) {
      return `组件设计完成，沉淀了 ${artifact.data.components.length} 个组件契约。`;
    }
  }

  if (artifact.key === "structure") {
    if (artifact.data === null) {
      return "结构规划已跳过，上游核心规划输入缺失。";
    }

    if (isWorkflowStructurePlan(artifact.data)) {
      return `结构规划完成，生成 ${artifact.data.files.length} 个文件规划项。`;
    }
  }

  if (artifact.key === "plan") {
    const appName =
      artifactData && typeof artifactData.appName === "string"
        ? artifactData.appName
        : "未命名应用";
    const routeCount =
      artifactData && Array.isArray(artifactData.routes)
        ? artifactData.routes.length
        : 0;

    return `规划完成，应用名为「${appName}」，共 ${routeCount} 个页面。`;
  }

  if (artifactData && Array.isArray(artifactData.files)) {
    return `${stepNode.title}已完成，当前规划了 ${artifactData.files.length} 个文件。`;
  }

  if (artifactData && Array.isArray(artifactData.entryFiles)) {
    return `${stepNode.title}已完成，入口文件数量 ${artifactData.entryFiles.length}。`;
  }

  return `${stepNode.title}已完成。`;
}

function markStepCompleted(
  workflow: PromptGenerationWorkflowState,
  stepNode: PromptGenerationStepNode,
  artifact: WorkflowArtifact,
) {
  const now = new Date().toISOString();
  const nextWorkflow = updatePhaseStatus(
    updateWorkflowStep(workflow, stepNode.id, (current) => ({
      ...current,
      completedAt: now,
      lastError: null,
      outputPreview: buildStepPreview(stepNode, artifact),
      status: "completed",
    })),
  );

  return applyPromptGenerationWorkflowUpdate(workflow, {
    artifacts: {
      [artifact.key]: artifact,
    },
    phases: nextWorkflow.phases,
    steps: nextWorkflow.steps,
    summary: buildSummaryPatch(nextWorkflow, artifact),
    workflowMeta: {
      currentPhaseId: stepNode.phaseId,
      currentStepId: stepNode.id,
      status: stepNode.id === "assembly" ? "completed" : "running",
      updatedAt: now,
    },
  });
}

function markAnalysisSkipDecision(
  workflow: PromptGenerationWorkflowState,
  stepNode: PromptGenerationStepNode,
  analysisResult: WorkflowAnalysisResult,
) {
  const now = new Date().toISOString();
  return applyPromptGenerationWorkflowUpdate(workflow, {
    workflowMeta: {
      currentPhaseId: stepNode.phaseId,
      currentStepId: stepNode.id,
      skipGeneration: true,
      status: "running",
      updatedAt: now,
    },
  });
}

function markWorkflowSkippedAfterPlanningNull(
  workflow: PromptGenerationWorkflowState,
  stepNode: PromptGenerationStepNode,
) {
  const now = new Date().toISOString();
  const reason = "规划阶段上游核心产物缺失，后续步骤已阻断。";
  const blockedWorkflow = blockRemainingSteps(workflow, stepNode.id, reason);

  return applyPromptGenerationWorkflowUpdate(blockedWorkflow, {
    phases: blockedWorkflow.phases,
    steps: blockedWorkflow.steps,
    workflowMeta: {
      currentPhaseId: stepNode.phaseId,
      currentStepId: stepNode.id,
      skipGeneration: true,
      status: "completed",
      updatedAt: now,
    },
  });
}

function shouldAutoReturnNullArtifact(
  workflow: PromptGenerationWorkflowState,
  stepId: PromptGenerationStepId,
) {
  switch (stepId) {
    case "intent":
      return workflow.workflowMeta.skipGeneration;
    case "capabilities":
      return workflow.artifacts.intent?.data === null;
    case "uiDesign":
      return workflow.artifacts.capabilities?.data === null;
    case "componentDesign":
      return workflow.artifacts.ui?.data === null;
    case "structurePlan":
      return (
        workflow.artifacts.ui?.data === null ||
        workflow.artifacts.componentContracts?.data === null ||
        workflow.artifacts.capabilities?.data === null
      );
    default:
      return false;
  }
}

function shouldStopAfterNullArtifact(stepId: PromptGenerationStepId) {
  return stepId === "structurePlan";
}

function buildRawContentPreview(rawContent: string) {
  const collapsed = rawContent.replace(/\s+/g, " ").trim();
  return collapsed.length > 160 ? `${collapsed.slice(0, 160)}...` : collapsed;
}

function normalizeAnalysisForCreateFlow(
  analysis: WorkflowAnalysisResult,
  routeContext: WorkbenchRouteContext,
) {
  if (
    routeContext.intent === "create_from_prompt" &&
    (analysis.type === "QA" || analysis.type === "CHIT_CHAT")
  ) {
    return {
      ...analysis,
      type: "CREATE" as const,
    };
  }

  return analysis;
}

function markStepFailed(
  workflow: PromptGenerationWorkflowState,
  stepNode: PromptGenerationStepNode,
  errorMessage: string,
) {
  const now = new Date().toISOString();
  const nextWorkflow = updatePhaseStatus(
    updateWorkflowStep(workflow, stepNode.id, (current) => ({
      ...current,
      completedAt: now,
      lastError: errorMessage,
      outputPreview: errorMessage,
      status: "failed",
    })),
  );

  return applyPromptGenerationWorkflowUpdate(workflow, {
    phases: nextWorkflow.phases,
    steps: nextWorkflow.steps,
    workflowMeta: {
      currentPhaseId: stepNode.phaseId,
      currentStepId: stepNode.id,
      status: "failed",
      updatedAt: now,
    },
  });
}

function buildFinalAssistantSummary(workflow: PromptGenerationWorkflowState) {
  if (workflow.workflowMeta.skipGeneration) {
    const analysisArtifact = workflow.artifacts.analysis;
    if (
      analysisArtifact &&
      isWorkflowAnalysisResult(analysisArtifact.data) &&
      shouldSkipGeneration(analysisArtifact.data)
    ) {
      return `需求分析已完成，并根据分析结果跳过后续生成。${analysisArtifact.data.summary}`;
    }

    return "规划阶段检测到上游核心产物缺失，后续生成已跳过。";
  }

  const appName = workflow.summary.appName ?? "当前应用";
  const entryFiles =
    workflow.summary.entryFiles.length > 0
      ? workflow.summary.entryFiles.join("、")
      : "暂未生成入口文件";

  return [
    "应用规划流程已完成。",
    `应用名称：「${appName}」。`,
    `共完成 ${workflow.summary.completedStepCount}/${workflow.summary.totalStepCount} 个步骤。`,
    `项目组装结果包含 ${workflow.summary.totalFiles} 个文件。`,
    `入口文件：${entryFiles}。`,
  ].join("");
}

export async function runPromptGenerationWorkflow({
  activeFilePath,
  messageText,
  routeContext,
  setPromptGenerationWorkflow,
  workflowMessageId,
  updateMessage,
}: RunPromptGenerationWorkflowOptions) {
  let workflow = createInitialPromptGenerationWorkflowState(messageText, {
    designContext: DEFAULT_PROMPT_GENERATION_DESIGN_CONTEXT,
  });
  setPromptGenerationWorkflow(workflow);

  updateMessage(workflowMessageId, {
    status: "streaming",
    text: "应用生成流程执行中。",
  });

  for (const stepNode of PROMPT_GENERATION_STEP_NODES) {
    let successArtifact: WorkflowArtifact | null = null;
    let lastError = "";

    if (shouldAutoReturnNullArtifact(workflow, stepNode.id)) {
      successArtifact = createWorkflowArtifact(
        stepNode.outputArtifactKey,
        stepNode.id,
        null,
      );
      workflow = markStepCompleted(workflow, stepNode, successArtifact);
      setPromptGenerationWorkflow(workflow);
      updateMessage(workflowMessageId, {
        text: buildStepPreview(stepNode, successArtifact),
      });

      if (shouldStopAfterNullArtifact(stepNode.id)) {
        workflow = markWorkflowSkippedAfterPlanningNull(workflow, stepNode);
        setPromptGenerationWorkflow(workflow);
        break;
      }

      continue;
    }

    for (let attempt = 1; attempt <= stepNode.maxAttempts; attempt += 1) {
      workflow = markStepRunning(workflow, stepNode, attempt);
      setPromptGenerationWorkflow(workflow);

      updateMessage(workflowMessageId, {
        text:
          attempt > 1
            ? `${stepNode.title} 第 ${attempt} 次重试中。`
            : `${stepNode.title} 执行中。`,
      });

      const dependencyArtifacts = stepNode.inputArtifactKeys
        .map((key) => workflow.artifacts[key])
        .filter(isArtifactEnvelope);
      const latestStep = workflow.steps.find((step) => step.id === stepNode.id);

      if (!latestStep) {
        lastError = `缺少步骤状态：${stepNode.id}`;
        continue;
      }

      const retryInstruction =
        attempt > 1
          ? buildPromptGenerationRetryInstruction(attempt - 1, lastError)
          : null;
      const context = {
        dependencyArtifacts,
        retryInstruction,
        step: latestStep,
        stepDefinition: stepNode,
        stepNode,
        userPrompt: messageText,
        workflow,
      };
      let rawContent = "";

      try {
        rawContent = await generateStructuredWorkflowStep({
          profile: routeContext.profile ?? "local",
          provider: routeContext.provider ?? "ollama",
          stepId: stepNode.id,
          systemPrompt: stepNode.buildSystemPrompt(context),
          userPrompt: [
            stepNode.buildUserPrompt(context),
            activeFilePath ? `当前文件：${activeFilePath}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
        });
        const schema = getPromptGenerationArtifactSchema(
          stepNode.outputArtifactKey,
        );

        if (!schema) {
          throw new Error(`未找到节点 schema：${stepNode.outputArtifactKey}`);
        }

        const parsedData = parseStructuredOutput(rawContent, schema);

        successArtifact = createWorkflowArtifact(
          stepNode.outputArtifactKey,
          stepNode.id,
          stepNode.id === "analysis" && isWorkflowAnalysisResult(parsedData)
            ? normalizeAnalysisForCreateFlow(parsedData, routeContext)
            : parsedData,
        );
        break;
      } catch (error) {
        const baseMessage =
          error instanceof Error ? error.message : "结构化输出解析失败。";
        lastError = rawContent
          ? `${baseMessage}；模型输出片段：${buildRawContentPreview(rawContent)}`
          : baseMessage;
        workflow = applyPromptGenerationWorkflowUpdate(workflow, {
          workflowMeta: {
            status: attempt < stepNode.maxAttempts ? "retrying" : "failed",
            updatedAt: new Date().toISOString(),
          },
        });
        setPromptGenerationWorkflow(workflow);
      }
    }

    if (!successArtifact) {
      workflow = markStepFailed(workflow, stepNode, lastError);
      setPromptGenerationWorkflow(workflow);
      updateMessage(workflowMessageId, {
        status: "error",
        text: `${stepNode.title} 失败：${lastError}`,
      });
      throw new Error(lastError);
    }

    workflow = markStepCompleted(workflow, stepNode, successArtifact);
    setPromptGenerationWorkflow(workflow);
    updateMessage(workflowMessageId, {
      text: buildStepPreview(stepNode, successArtifact),
    });

    if (
      successArtifact.key === "analysis" &&
      isWorkflowAnalysisResult(successArtifact.data) &&
      shouldSkipGeneration(successArtifact.data)
    ) {
      workflow = markAnalysisSkipDecision(
        workflow,
        stepNode,
        successArtifact.data,
      );
      setPromptGenerationWorkflow(workflow);
    }
  }

  const finalMessage = buildFinalAssistantSummary(workflow);
  updateMessage(workflowMessageId, {
    status: "done",
    text: workflow.workflowMeta.skipGeneration
      ? "规划阶段已完成，后续生成已跳过。"
      : "应用生成流程已完成。",
  });

  return {
    finalMessage,
    workflow,
  };
}
