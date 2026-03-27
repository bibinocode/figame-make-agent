import { ChatDeepSeek } from "@langchain/deepseek";
import type { ResolvedChatModelOptions } from "../../types/runtime";

/**
 * 创建 DeepSeek ChatModel
 *
 * 这里直接使用 LangChain 官方的 DeepSeek integration。
 * 不再走 OpenAI 兼容模式的“曲线接法”。
 */
export function createDeepSeekChatModel(options: ResolvedChatModelOptions) {
  return new ChatDeepSeek({
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    apiKey: options.apiKey,
  });
}
