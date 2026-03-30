"use client";

import type {
  WorkbenchRoutingNode,
  WorkbenchRoutingStep,
} from "../state/workbench-routing-types";

type RoutingAnalysisNodeProps = {
  node: WorkbenchRoutingNode;
};

function getStepDotClass(status: WorkbenchRoutingStep["status"]) {
  switch (status) {
    case "done":
      return "border-emerald-500 bg-emerald-50";
    case "active":
      return "border-[var(--workbench-accent)] bg-[var(--workbench-accent-soft)]";
    case "error":
      return "border-rose-500 bg-rose-50";
    default:
      return "border-[var(--workbench-line)] bg-[var(--workbench-surface)]";
  }
}

function getStepTextClass(status: WorkbenchRoutingStep["status"]) {
  switch (status) {
    case "active":
      return "text-[var(--workbench-accent-strong)]";
    case "error":
      return "text-rose-700";
    default:
      return "text-[var(--workbench-text)]";
  }
}

export function RoutingAnalysisNode({ node }: RoutingAnalysisNodeProps) {
  return (
    <section className="mr-auto max-w-[96%] border border-[var(--workbench-line)] bg-[var(--workbench-surface)]">
      <div className="border-b border-[var(--workbench-line)] bg-[var(--workbench-surface-alt)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--workbench-muted)]">
              路由分析
            </p>
            <h3 className="mt-1 text-sm font-semibold text-[var(--workbench-text)]">
              {node.title}
            </h3>
          </div>
          <div className="border border-[var(--workbench-accent-soft)] bg-[var(--workbench-accent-soft)] px-2 py-1 text-xs font-medium text-[var(--workbench-accent-strong)]">
            {node.badge}
          </div>
        </div>

        <p className="mt-2 text-sm leading-6 text-[var(--workbench-muted)]">
          {node.summary}
        </p>
      </div>

      <div className="space-y-4 px-4 py-4">
        {node.steps.map((step) => (
          <div className="flex gap-3" key={step.id}>
            <div className="flex flex-col items-center">
              <span
                className={[
                  "mt-1 block h-3 w-3 border-2",
                  getStepDotClass(step.status),
                ].join(" ")}
              />
              <span className="mt-2 h-full w-px bg-[var(--workbench-line)] last:hidden" />
            </div>
            <div className="min-w-0 pb-1">
              <p
                className={[
                  "text-sm font-medium",
                  getStepTextClass(step.status),
                ].join(" ")}
              >
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--workbench-muted)]">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
