"use client";

import { getPromptGenerationStepDefinition } from "@figame/agent-core";
import type { WorkbenchChatMessage } from "../state/workbench-routing-types";
import { useWorkbenchRoutingStore } from "../state/use-workbench-routing-store";

type WorkflowStepNodeProps = {
  message: WorkbenchChatMessage;
};

function ThinkingBar() {
  return (
    <div className="h-1 overflow-hidden bg-slate-100">
      <div className="h-full w-1/3 animate-[workflow-slide_1.2s_ease-in-out_infinite] bg-sky-500" />
    </div>
  );
}

function getWorkflowBadge(status: string) {
  switch (status) {
    case "completed":
      return "已完成";
    case "failed":
      return "执行失败";
    case "retrying":
      return "重试中";
    case "running":
    case "planning":
      return "执行中";
    default:
      return "等待中";
  }
}

function getStepTone(status: string, isActive: boolean) {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (isActive || status === "running") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-slate-200 bg-white text-slate-500";
}

function getStepLabel(status: string, isActive: boolean) {
  if (status === "completed") {
    return "完成";
  }

  if (status === "failed") {
    return "失败";
  }

  if (isActive || status === "running") {
    return "执行中";
  }

  return "待执行";
}

export function WorkflowStepNode({ message }: WorkflowStepNodeProps) {
  const workflow = useWorkbenchRoutingStore(
    (state) => state.promptGenerationWorkflow,
  );
  const updateMessage = useWorkbenchRoutingStore((state) => state.updateMessage);

  if (!workflow || !message.workflowNode) {
    return null;
  }

  const { workflowNode } = message;
  const collapsed = workflowNode.collapsed ?? false;
  const canCollapse = workflowNode.canCollapse ?? false;
  const activeStepId = workflow.workflowMeta.currentStepId;
  const activePhaseId = workflow.workflowMeta.currentPhaseId;
  const failedStep = workflow.steps.find((step) => step.status === "failed");
  const activePhase = workflow.phases.find((phase) => phase.id === activePhaseId);
  const visibleSteps = workflow.steps.filter(
    (step) => step.status !== "pending" || step.attemptCount > 0,
  );

  const toggleCollapsed = () => {
    if (!canCollapse) {
      return;
    }

    updateMessage(message.id, {
      workflowNode: {
        ...workflowNode,
        collapsed: !collapsed,
      },
    });
  };

  return (
    <section className="mr-auto max-w-[94%] border border-slate-200 bg-white">
      <button
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
        disabled={!canCollapse}
        onClick={toggleCollapsed}
        type="button"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.14em] text-slate-400">
            应用生成流程
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-950">
            {workflowNode.summaryTitle ?? workflow.summary.appName ?? "应用规划执行中"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {workflowNode.summaryDetail ??
              `当前阶段：${activePhase?.title ?? "等待开始"}，已完成 ${workflow.summary.completedStepCount}/${workflow.summary.totalStepCount} 步。`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
            {getWorkflowBadge(workflow.workflowMeta.status)}
          </div>
          {canCollapse ? (
            <div className="text-xs text-slate-400">
              {collapsed ? "展开" : "收起"}
            </div>
          ) : null}
        </div>
      </button>

      {collapsed ? null : (
        <>
          <div className="border-t border-slate-100 px-4 pb-4">
            {workflow.workflowMeta.status === "running" ||
            workflow.workflowMeta.status === "planning" ||
            workflow.workflowMeta.status === "retrying" ? (
              <div className="pt-4">
                <ThinkingBar />
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-100 px-4 py-4">
            <div className="space-y-2">
              {visibleSteps.map((step, index) => {
                const isActive = step.id === activeStepId;
                const stepDefinition = getPromptGenerationStepDefinition(step.id);

                return (
                  <div
                    className={[
                      "border px-3 py-3 transition-colors",
                      getStepTone(step.status, isActive),
                    ].join(" ")}
                    key={step.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                          阶段节点 {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium">{step.title}</p>
                        {step.outputPreview ? (
                          <p className="mt-2 line-clamp-2 text-xs leading-6 text-inherit/80">
                            {step.outputPreview}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-xs">
                        {getStepLabel(step.status, isActive)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-inherit/70">
                      <span>尝试 {step.attemptCount}/{stepDefinition?.maxAttempts ?? 3}</span>
                      <span>
                        {workflow.phases.find((phase) => phase.id === step.phaseId)?.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {failedStep?.lastError ? (
            <div className="border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {failedStep.lastError}
            </div>
          ) : null}
        </>
      )}

      <style jsx>{`
        @keyframes workflow-slide {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(320%);
          }
        }
      `}</style>
    </section>
  );
}
