import type { ProviderDescriptor } from "../../types/model";
import { createOpenAIChatModel } from "./chat";

export const openaiProviderDescriptor: ProviderDescriptor = {
  id: "openai",
  capabilities: {
    // 表示 openai provider 具备 chat 能力
    chat: createOpenAIChatModel,
  },
  defaults: {
    structuredMethod: "functionCalling",
  },
};
