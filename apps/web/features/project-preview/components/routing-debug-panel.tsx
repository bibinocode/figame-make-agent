"use client";

import type { WorkbenchRoutingNode, WorkbenchRoutingStep } from "../state/workbench-routing-types";

type RoutingAnalysisNodeProps = {
  node: WorkbenchRoutingNode;
};

function getStepDotClass(status: WorkbenchRoutingStep["status"]) {
  switch (status) {
    case "done":
      return "border-emerald-500 bg-emerald-50";
    case "active":
      return "border-fuchsia-500 bg-fuchsia-50";
    case "error":
      return "border-rose-500 bg-rose-50";
    default:
      return "border-slate-300 bg-white";
  }
}

function getStepTextClass(status: WorkbenchRoutingStep["status"]) {
  switch (status) {
    case "active":
      return "text-fuchsia-700";
    case "error":
      return "text-rose-700";
    default:
      return "text-slate-700";
  }
}

export function RoutingAnalysisNode({ node }: RoutingAnalysisNodeProps) {
  return (
    <section className="mr-auto max-w-[94%] rounded-[26px] border border-slate-200 bg-white/95 px-4 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">标准流程</p>
          <h3 className="mt-2 text-base font-semibold text-slate-950">
            {node.title}
          </h3>
        </div>
        <div className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-medium text-fuchsia-700">
          {node.badge}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{node.summary}</p>

      <div className="mt-4 space-y-4 border-l border-fuchsia-100 pl-4">
        {node.steps.map((step) => (
          <div className="relative" key={step.id}>
            <span
              className={[
                "absolute -left-[1.15rem] top-2 block h-3 w-3 rounded-full border-2",
                getStepDotClass(step.status),
              ].join(" ")}
            />
            <p className={["text-sm font-medium", getStepTextClass(step.status)].join(" ")}>
              {step.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{step.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
