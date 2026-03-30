import type {
  AgentInputEnvelope,
  RoutingDecision,
  RoutingIntent,
} from "@figame/agent-core";
import { runRoutingPipeline } from "@figame/agent-core";
import { resolveFlowIdForIntent } from "@figame/agent-flows";
import type {
  WorkbenchRouteContext,
  WorkbenchRoutingNode,
  WorkbenchRoutingSnapshot,
  WorkbenchRoutingStep,
} from "../state/workbench-routing-types";

function getIntentLabel(intent: RoutingIntent | null) {
  switch (intent) {
    case "create_from_figma":
      return "Figma 设计稿创作";
    case "create_from_prompt":
      return "提示词创作";
    case "create_from_reference_image":
      return "参考图创作";
    case "modify_existing_project":
      return "项目修改";
    default:
      return "未识别";
  }
}

function getFlowLabel(flowId: string | null) {
  switch (flowId) {
    case "create-from-figma":
      return "从 Figma 设计稿生成";
    case "create-from-prompt":
      return "从提示词生成";
    default:
      return flowId ?? "暂未命中执行流";
  }
}

function buildDebugTrace(decision: RoutingDecision, activeFlowId: string | null) {
  return [
    ...decision.diagnostics,
    activeFlowId
      ? `Resolved active flow: ${activeFlowId}.`
      : "No active flow could be resolved.",
  ];
}

function createStep(
  id: string,
  title: string,
  detail: string,
  status: WorkbenchRoutingStep["status"],
): WorkbenchRoutingStep {
  return {
    id,
    title,
    detail,
    status,
  };
}

export function createPendingRoutingNode(): WorkbenchRoutingNode {
  return {
    title: "标准流程",
    badge: "分析中",
    summary: "正在解析输入并匹配最合适的 Agent 路由。",
    status: "active",
    steps: [
      createStep("normalize", "输入解析", "正在抽取正文、链接和上下文。", "active"),
      createStep("intent", "意图识别", "等待生成候选意图。", "pending"),
      createStep("route", "路由决策", "等待选择执行流。", "pending"),
      createStep("bridge", "模型桥接", "等待连接本地模型。", "pending"),
    ],
  };
}

export function createRouteContext(
  snapshot: WorkbenchRoutingSnapshot,
  activeFilePath?: string,
): WorkbenchRouteContext {
  const accepted = snapshot.routingDecision?.accepted ?? null;

  return {
    activeFilePath,
    activeFlowId: snapshot.activeFlowId,
    intent: accepted?.intent ?? null,
    provider: accepted?.suggestedProvider ?? null,
    profile: accepted?.suggestedProfile ?? null,
    sourceKinds:
      snapshot.normalizedEnvelope?.sources.map((source) => source.kind) ?? [],
  };
}

export function buildRoutingNode(
  snapshot: WorkbenchRoutingSnapshot,
): WorkbenchRoutingNode {
  const accepted = snapshot.routingDecision?.accepted ?? null;
  const sourceSummary =
    snapshot.normalizedEnvelope?.sources.map((source) => source.kind).join("、") ??
    "无输入";

  if (!accepted || !snapshot.activeFlowId) {
    return {
      title: "标准流程",
      badge: "分析失败",
      summary: "本轮没有命中可执行路由，请补充更明确的需求或有效链接。",
      status: "error",
      steps: [
        createStep("normalize", "输入解析", `识别到的输入源：${sourceSummary}`, "done"),
        createStep(
          "intent",
          "意图识别",
          `候选数量：${snapshot.intentCandidates.length}`,
          snapshot.intentCandidates.length > 0 ? "done" : "error",
        ),
        createStep("route", "路由决策", "当前没有命中可执行流。", "error"),
        createStep("bridge", "模型桥接", "由于路由失败，未发起模型调用。", "error"),
      ],
    };
  }

  return {
    title: "标准流程",
    badge: "分析完成",
    summary: `已识别 ${sourceSummary}，主意图为 ${getIntentLabel(accepted.intent)}。`,
    status: "active",
    steps: [
      createStep("normalize", "输入解析", `识别到的输入源：${sourceSummary}`, "done"),
      createStep(
        "intent",
        "意图识别",
        `主意图：${getIntentLabel(accepted.intent)}`,
        "done",
      ),
      createStep(
        "route",
        "路由决策",
        `执行流：${getFlowLabel(snapshot.activeFlowId)}`,
        "done",
      ),
      createStep(
        "bridge",
        "模型桥接",
        `准备连接 ${accepted.suggestedProvider ?? "auto"} / ${accepted.suggestedProfile}。`,
        "active",
      ),
    ],
  };
}

export function runWorkbenchRouting(
  envelope: AgentInputEnvelope,
): WorkbenchRoutingSnapshot {
  const routingDecision = runRoutingPipeline(envelope);
  const activeFlowId = routingDecision.accepted
    ? resolveFlowIdForIntent(routingDecision.accepted.intent)
    : null;

  return {
    normalizedEnvelope: envelope,
    adapterResults: routingDecision.adapterResults,
    intentCandidates: [
      ...(routingDecision.accepted ? [routingDecision.accepted] : []),
      ...routingDecision.rejected,
    ],
    routingDecision,
    activeFlowId,
    executionStatus: routingDecision.accepted ? "routed" : "error",
    debugTrace: buildDebugTrace(routingDecision, activeFlowId),
  };
}

export function buildRoutingFailureReply(
  snapshot: WorkbenchRoutingSnapshot,
): { html: string; text: string } {
  const trace = snapshot.debugTrace[0] ?? "这次没有拿到可执行路由。";

  return {
    html: [
      "<p>我已经完成路由分析，但这轮还不能直接进入生成。</p>",
      `<p>${trace}</p>`,
      "<p>你可以继续补充更明确的需求，或者贴一个有效的 Figma 链接，我会重新分析。</p>",
    ].join(""),
    text: `我已经完成路由分析，但这轮还不能直接进入生成。${trace} 你可以继续补充更明确的需求，或者贴一个有效的 Figma 链接，我会重新分析。`,
  };
}
