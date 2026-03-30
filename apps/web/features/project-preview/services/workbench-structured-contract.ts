import type {
  ProviderId,
  ProviderProfileId,
  PromptGenerationStepId,
} from "@figame/agent-core";

export type WorkbenchStructuredRequest = {
  provider?: ProviderId | null;
  profile?: ProviderProfileId | null;
  stepId: PromptGenerationStepId;
  systemPrompt: string;
  userPrompt: string;
};

export type WorkbenchStructuredResponse = {
  content: string;
};
