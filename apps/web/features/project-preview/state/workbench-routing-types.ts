import type {
  AdapterResult,
  AgentInputEnvelope,
  IntentCandidate,
  PromptGenerationWorkflowState,
  ProviderId,
  ProviderProfileId,
  RoutingDecision,
  RoutingIntent,
} from "@figame/agent-core";
import type { FlowId } from "@figame/agent-flows";

export type AttachmentItem = {
  id: string;
  kind: "document" | "image";
  mimeType: string;
  name: string;
};

export type WorkbenchMessageRole = "user" | "assistant" | "system";

export type WorkbenchMessageKind = "text" | "routing" | "workflow";

export type WorkbenchMessageStatus = "done" | "streaming" | "error";

export type WorkbenchRoutingStepStatus = "pending" | "active" | "done" | "error";

export type WorkbenchRoutingStep = {
  id: string;
  title: string;
  detail: string;
  status: WorkbenchRoutingStepStatus;
};

export type WorkbenchRoutingNode = {
  title: string;
  badge: string;
  summary: string;
  status: WorkbenchRoutingStepStatus;
  steps: WorkbenchRoutingStep[];
};

export type WorkbenchWorkflowNode = {
  workflowId: string;
  collapsed?: boolean;
  canCollapse?: boolean;
  summaryTitle?: string | null;
  summaryDetail?: string | null;
};

export type WorkbenchChatMessage = {
  id: string;
  role: WorkbenchMessageRole;
  kind: WorkbenchMessageKind;
  html: string;
  text: string;
  createdAt: string;
  status: WorkbenchMessageStatus;
  routingNode?: WorkbenchRoutingNode;
  workflowNode?: WorkbenchWorkflowNode;
};

export type WorkbenchExecutionStatus =
  | "idle"
  | "analyzing"
  | "routed"
  | "running"
  | "error";

export type WorkbenchRoutingSnapshot = {
  normalizedEnvelope: AgentInputEnvelope | null;
  adapterResults: AdapterResult[];
  intentCandidates: IntentCandidate[];
  routingDecision: RoutingDecision | null;
  activeFlowId: FlowId | null;
  executionStatus: WorkbenchExecutionStatus;
  debugTrace: string[];
};

export type WorkbenchRouteContext = {
  activeFilePath?: string;
  activeFlowId: FlowId | null;
  intent: RoutingIntent | null;
  provider: ProviderId | null;
  profile: ProviderProfileId | null;
  sourceKinds: string[];
};

export type WorkbenchChatHistoryItem = {
  content: string;
  role: "assistant" | "user";
};

export type WorkbenchRoutingState = WorkbenchRoutingSnapshot & {
  composerHtml: string;
  messages: WorkbenchChatMessage[];
  attachments: AttachmentItem[];
  promptGenerationWorkflow: PromptGenerationWorkflowState | null;
  setComposerHtml: (value: string) => void;
  clearComposer: () => void;
  appendMessage: (value: WorkbenchChatMessage) => void;
  updateMessage: (
    id: string,
    value: Partial<
      Omit<WorkbenchChatMessage, "createdAt" | "id" | "role">
    >,
  ) => void;
  removeMessage: (id: string) => void;
  setAttachments: (value: AttachmentItem[]) => void;
  applyRoutingSnapshot: (value: WorkbenchRoutingSnapshot) => void;
  setPromptGenerationWorkflow: (
    value: PromptGenerationWorkflowState | null,
  ) => void;
  setExecutionStatus: (value: WorkbenchExecutionStatus) => void;
  resetRouting: () => void;
};
