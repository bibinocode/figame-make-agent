export type ProviderProfileId =
  | "main"
  | "planner"
  | "structured"
  | "fast"
  | "vision"
  | "embedding"
  | "local";

export type ProviderId =
  | "minimax"
  | "deepseek"
  | "openai"
  | "ollama";

export type AdapterId =
  | "prompt-adapter"
  | "figma-link-adapter"
  | "file-adapter"
  | "image-adapter"
  | "modify-adapter";

export type RoutingIntent =
  | "create_from_prompt"
  | "create_from_figma"
  | "create_from_reference_image"
  | "modify_existing_project";

export type RoutingCapability =
  | "chat"
  | "structured"
  | "embedding"
  | "vision";

export type InputSource =
  | {
      kind: "prompt";
      text: string;
    }
  | {
      kind: "figma_link";
      url: string;
    }
  | {
      kind: "uploaded_file";
      fileId: string;
      mimeType: string;
      name: string;
    }
  | {
      kind: "reference_image";
      fileId: string;
      mimeType: string;
      name: string;
    }
  | {
      kind: "modify_request";
      text: string;
    };

export type AgentInputEnvelope = {
  id: string;
  createdAt: string;
  sources: InputSource[];
  workspaceContext?: {
    projectId?: string;
    hasOpenTemplate: boolean;
    activeFilePath?: string;
  };
};

export type IntentCandidate = {
  adapterId: AdapterId;
  intent: RoutingIntent;
  score: number;
  priority: number;
  reason: string;
  evidence: string[];
  suggestedFlowId: string;
  suggestedProfile: ProviderProfileId;
  suggestedProvider?: ProviderId;
  requiredCapabilities: RoutingCapability[];
};

export type AdapterResult = {
  adapterId: AdapterId;
  candidates: IntentCandidate[];
  diagnostics: string[];
};

export type RoutingDecision = {
  envelope: AgentInputEnvelope;
  adapterResults: AdapterResult[];
  accepted: IntentCandidate | null;
  rejected: IntentCandidate[];
  diagnostics: string[];
};

export type RoutingAdapter = (envelope: AgentInputEnvelope) => AdapterResult;
