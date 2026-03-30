import type { ProviderId, ProviderProfileId, RoutingIntent } from "@figame/agent-core";
import type { FlowId } from "@figame/agent-flows";

export type WorkbenchAgentChatRequest = {
  activeFilePath?: string;
  history: Array<{
    content: string;
    role: "assistant" | "user";
  }>;
  messageText: string;
  routeContext: {
    activeFlowId: FlowId | null;
    intent: RoutingIntent | null;
    provider: ProviderId | null;
    profile: ProviderProfileId | null;
    sourceKinds: string[];
  };
};
