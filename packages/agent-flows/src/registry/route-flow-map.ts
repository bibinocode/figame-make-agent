import type { RoutingIntent } from "@figame/agent-core";
import type { FlowId } from "../shared/types/routing-flow";

const INTENT_FLOW_MAP: Record<RoutingIntent, FlowId> = {
  create_from_figma: "create-from-figma",
  create_from_prompt: "create-from-prompt",
  create_from_reference_image: "create-from-image",
  modify_existing_project: "modify-project",
};

export function resolveFlowIdForIntent(intent: RoutingIntent): FlowId {
  return INTENT_FLOW_MAP[intent];
}
