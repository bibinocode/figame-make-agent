import type { ProviderDescriptor } from "../../types/model";
import { createDeepSeekChatModel } from "./chat";

// 这里只声明“deepseek 是一个合法 provider”
// 真正的 chat 创建逻辑，下一步再接到 capabilities.chat 上。
export const deepseekProviderDescriptor: ProviderDescriptor = {
  id: "deepseek",
  capabilities: {
    chat: createDeepSeekChatModel,
  },
  defaults: {
    baseURL: "https://api.deepseek.com",
    structuredMethod: "functionCalling",
  },
};
