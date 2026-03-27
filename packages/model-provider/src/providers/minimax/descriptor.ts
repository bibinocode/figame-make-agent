import type { ProviderDescriptor } from "../../types/model";
import { createMiniMaxChatModel } from "./chat";

export const minimaxProviderDescriptor: ProviderDescriptor = {
  id: "minimax",
  capabilities: {
    chat: createMiniMaxChatModel,
  },
  defaults: {
    structuredMethod: "functionCalling",
  },
};
