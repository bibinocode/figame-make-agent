import { ChatOpenAI } from "@langchain/openai";
import { ResolvedChatModelOptions } from "../../types/runtime";

/**
 * 创建 OpenAI ChatModel
 *
 * 这里的 options 已经是“最终运行时配置”，
 * 所以不应该再做任何默认值推断和 env 读取。
 */
export function createOpenAIChatModel(options: ResolvedChatModelOptions) {
  return new ChatOpenAI({
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    apiKey: options.apiKey,

    // 如果外部配置显式传了 baseURL，这里就透传。
    // 这样后面也能支持 OpenAI-compatible 服务。
    configuration: options.baseURL
      ? {
          baseURL: options.baseURL,
        }
      : undefined,
  });
}
